"""
investigation_workflow.py
--------------------------
Module 5: Agentic Workflow with LangGraph.

Six agents, wired as a LangGraph StateGraph:

    query_analysis
          |
     +----+----+
     |         |
 visual_    document_
 analysis   retrieval        (parallel - both only need the query)
     |         |
     +----+----+
          |
   evidence_validation       (fan-in: reuses llm.generate_answer for
                               citation-checked, grounded evidence)
          |
       reasoning               (severity + recommended action)
          |
  report_generation           (assembles final markdown report)

Each node is a plain function over a shared TypedDict state - LangGraph
merges whatever dict a node returns into that shared state, then routes to
the next node(s). This module deliberately reuses existing project code as
"tools" inside each agent rather than reimplementing detection/retrieval/
answer-generation logic:

  - visual_analysis   -> detector.run_detection / run_video_detection,
                          plus the image/video summary builders already
                          defined in detect_routes.py
  - document_retrieval -> vector_store.search_documents, plus the
                          per-file-capped filter already fixed in
                          detect_routes.py
  - evidence_validation -> llm.generate_answer (draft + verify + citation
                          extraction), so "validated evidence" here is the
                          same grounded evidence/confidence logic already
                          proven out in Module 4

run_investigation() is the single entry point routes should call.
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, TypedDict

from groq import Groq
from langgraph.graph import StateGraph, END

from detector import run_detection, run_video_detection
from vector_store import search_documents
from llm import generate_answer, GROQ_API_KEY, DEFAULT_MODEL
from detect_routes import (
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_VIDEO_EXTENSIONS,
    _build_image_context,
    _build_video_context,
    _filter_search_results,
)

_client: Optional[Groq] = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set.")
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def _chat(system_prompt: str, user_prompt: str, max_tokens: int = 400) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


# ---------------------------------------------------------------------------
# Shared state
# ---------------------------------------------------------------------------

class InvestigationState(TypedDict, total=False):
    query: str
    file_path: str
    kind: str                      # "image" | "video"

    search_query: str              # produced by query_analysis
    investigation_focus: str       # produced by query_analysis

    detection_result: dict         # produced by visual_analysis
    detected_classes: List[str]
    visual_summary: str

    retrieved_chunks: List[dict]   # produced by document_retrieval

    evidence: List[dict]           # produced by evidence_validation
    validated_answer: str
    grounded: bool
    confidence: str

    reasoning: str                 # produced by reasoning
    severity: str
    recommended_action: str

    report: str                    # produced by report_generation
    errors: List[str]


# ---------------------------------------------------------------------------
# Agent 1: Query Analysis
# ---------------------------------------------------------------------------

QUERY_ANALYSIS_PROMPT = (
    "You are the Query Analysis agent in a PPE compliance investigation "
    "pipeline. Given an investigator's request, produce exactly two lines:\n"
    "SEARCH: <3-8 concrete keywords for a document similarity search - name "
    "the exact PPE items involved (e.g. hardhat, safety vest, gloves, "
    "goggles, respirator, harness) plus a word like 'requirements' or "
    "'compliance'. Write this as short keyword phrases the way a safety "
    "manual's own section headers would be worded - e.g. 'hardhat safety "
    "vest requirements' - NOT a paraphrased full sentence. This line is "
    "used directly for similarity search against manual text, and specific "
    "overlapping terms match far better than an abstract description of "
    "the request.\n"
    "FOCUS: <one sentence, for a human reader, describing what this "
    "investigation is actually trying to determine>\n"
    "Output only those two lines, nothing else."
)


def query_analysis_node(state: InvestigationState) -> dict:
    query = state.get("query") or "Investigate PPE compliance in the uploaded media."
    try:
        raw = _chat(QUERY_ANALYSIS_PROMPT, f"Investigator request: {query}")
        search_query, focus = query, "General PPE compliance review."
        for line in raw.splitlines():
            if line.upper().startswith("SEARCH:"):
                search_query = line.split(":", 1)[1].strip() or query
            elif line.upper().startswith("FOCUS:"):
                focus = line.split(":", 1)[1].strip() or focus
        return {"search_query": search_query, "investigation_focus": focus}
    except Exception as e:
        return {
            "search_query": query,
            "investigation_focus": "General PPE compliance review.",
            "errors": state.get("errors", []) + [f"query_analysis: {e}"],
        }

def visual_analysis_node(state: InvestigationState) -> dict:
    file_path = state.get("file_path")
    ext = Path(file_path).suffix.lower() if file_path else ""

    try:
        if ext in ALLOWED_VIDEO_EXTENSIONS:
            detection = run_video_detection(file_path, frame_interval_sec=1.0, max_frames=20)
            summary = _build_video_context(detection)
            classes = sorted([c for c in (detection.get("class_counts", {}) or {}).keys() if c])
            kind = "video"
        else:
            detection = run_detection(file_path)
            summary = _build_image_context(detection.get("detections", []))
            classes = [d.get("class") for d in detection.get("detections", []) if d.get("class")]
            kind = "image"

        return {
            "kind": kind,
            "detection_result": detection,
            "detected_classes": classes,
            "visual_summary": summary,
        }
    except Exception as e:
        return {
            "kind": "unknown",
            "detection_result": {},
            "detected_classes": [],
            "visual_summary": "Visual analysis could not be completed.",
            "errors": state.get("errors", []) + [f"visual_analysis: {e}"],
        }

def document_retrieval_node(state: InvestigationState) -> dict:
    search_query = state.get("search_query") or state.get("query", "")
    try:
        raw_results = search_documents(search_query, top_k=15)
        filtered = _filter_search_results(raw_results, top_k=5)
        return {"retrieved_chunks": filtered}
    except Exception as e:
        return {
            "retrieved_chunks": [],
            "errors": state.get("errors", []) + [f"document_retrieval: {e}"],
        }


def evidence_validation_node(state: InvestigationState) -> dict:
    query = state.get("investigation_focus") or state.get("query", "")
    chunks = state.get("retrieved_chunks", [])
    summary = state.get("visual_summary")

    result = generate_answer(query, chunks, analysis_summary=summary)

    return {
        "evidence": result["evidence"],
        "validated_answer": result["answer"],
        "grounded": result["grounded"],
        "confidence": result["confidence"],
    }


REASONING_PROMPT = (
    "You are the Reasoning agent in a PPE compliance investigation pipeline. "
    "You will be given the visual findings, the validated/grounded answer "
    "from the evidence validation step, and the detected PPE classes. "
    "Determine the compliance conclusion. Output exactly three lines:\n"
    "SEVERITY: <one of: none, minor, moderate, severe>\n"
    "ACTION: <one concise recommended action a site supervisor should take>\n"
    "REASONING: <2-3 sentences explaining the conclusion, grounded only in "
    "the visual findings and validated answer given to you - do not invent "
    "facts not present in either>\n"
    "Output only those three lines, nothing else."
)


def reasoning_node(state: InvestigationState) -> dict:
    if not state.get("grounded", False):
        return {
            "severity": "unknown",
            "recommended_action": "Insufficient grounded evidence to determine an action. Manual review required.",
            "reasoning": "No validated evidence was available to support a compliance conclusion.",
        }

    context = (
        f"Detected PPE classes: {', '.join(state.get('detected_classes', [])) or 'none'}\n"
        f"Visual summary: {state.get('visual_summary', '')}\n"
        f"Validated answer: {state.get('validated_answer', '')}\n"
        f"Confidence: {state.get('confidence', '')}"
    )
    try:
        raw = _chat(REASONING_PROMPT, context, max_tokens=300)
        severity, action, reasoning = "unknown", "Manual review required.", raw
        for line in raw.splitlines():
            if line.upper().startswith("SEVERITY:"):
                severity = line.split(":", 1)[1].strip().lower() or severity
            elif line.upper().startswith("ACTION:"):
                action = line.split(":", 1)[1].strip() or action
            elif line.upper().startswith("REASONING:"):
                reasoning = line.split(":", 1)[1].strip() or reasoning
        return {"severity": severity, "recommended_action": action, "reasoning": reasoning}
    except Exception as e:
        return {
            "severity": "unknown",
            "recommended_action": "Manual review required.",
            "reasoning": "Reasoning step failed.",
            "errors": state.get("errors", []) + [f"reasoning: {e}"],
        }


def report_generation_node(state: InvestigationState) -> dict:
    classes = state.get("detected_classes", []) or []
    evidence = state.get("evidence", []) or []

    evidence_md = "\n".join(
        f"- **{e['source']}**"
        + (f" ({e['section']})" if e.get("section") and e["section"] != "N/A" else "")
        + f" — relevance {e.get('relevance', 'N/A')}\n  > {e['excerpt']}"
        for e in evidence
    ) or "_No grounded evidence was found._"

    report = f"""# PPE Compliance Investigation Report

**Investigation focus:** {state.get('investigation_focus', state.get('query', ''))}
**Media type analyzed:** {state.get('kind', 'unknown')}
**Grounded:** {'Yes' if state.get('grounded') else 'No'}
**Confidence:** {state.get('confidence', 'unknown')}
**Severity:** {state.get('severity', 'unknown')}

## Visual Findings
{state.get('visual_summary', 'N/A')}

Detected classes: {', '.join(classes) if classes else 'none'}

## Validated Answer
{state.get('validated_answer', 'N/A')}

## Supporting Evidence
{evidence_md}

## Reasoning
{state.get('reasoning', 'N/A')}

## Recommended Action
{state.get('recommended_action', 'N/A')}
"""
    return {"report": report}


# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------

def _build_graph():
    graph = StateGraph(InvestigationState)

    graph.add_node("query_analysis", query_analysis_node)
    graph.add_node("visual_analysis", visual_analysis_node)
    graph.add_node("document_retrieval", document_retrieval_node)
    graph.add_node("evidence_validation", evidence_validation_node)
    graph.add_node("reasoning", reasoning_node)
    graph.add_node("report_generation", report_generation_node)

    graph.set_entry_point("query_analysis")

    # Fan-out: both branches only depend on query_analysis, so they run
    # as parallel steps in the same super-step.
    graph.add_edge("query_analysis", "visual_analysis")
    graph.add_edge("query_analysis", "document_retrieval")

    # Fan-in: evidence_validation waits for both branches to complete.
    graph.add_edge("visual_analysis", "evidence_validation")
    graph.add_edge("document_retrieval", "evidence_validation")

    graph.add_edge("evidence_validation", "reasoning")
    graph.add_edge("reasoning", "report_generation")
    graph.add_edge("report_generation", END)

    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = _build_graph()
    return _compiled_graph


def run_investigation(query: str, file_path: str) -> InvestigationState:
    """
    Run the full six-agent investigation workflow synchronously and return
    the final state (includes the assembled report plus every intermediate
    field, useful for showing a reviewer the full reasoning chain).
    """
    graph = get_graph()
    initial_state: InvestigationState = {
        "query": query,
        "file_path": file_path,
        "errors": [],
    }
    final_state = graph.invoke(initial_state)
    return final_state