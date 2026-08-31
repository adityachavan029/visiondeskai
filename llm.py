"""
llm.py
------
Groq LLM integration for generating answers from retrieved document chunks.

Given a user's query and the top-matching chunks pulled from the vector
store, this generates an answer in two passes:

  1. Draft  - a Groq-hosted LLM writes a normal answer from the excerpts.
  2. Verify - a second, separate call acts as a strict fact-checker, rewriting
              the draft so every word and claim is literally backed by the
              excerpts. Running this as its own call (rather than just asking
              the drafting model to "be careful") is what actually catches
              paraphrase-as-quote and inferred-observation hallucinations -
              e.g. the draft saying "helmet" when the source says "hardhat",
              or saying a rule was "observed" when the source only states it
              as a requirement.

generate_answer() returns a structured dict:

    {
        "answer": "...",
        "evidence": [
            {
                "source": "ppe_safety_manual.txt",
                "section": "SECTION 1: HARDHAT REQUIREMENTS",
                "excerpt": "All workers must wear an approved hardhat...",
                "relevance": "87%"
            },
            ...
        ],
        "grounded": true,
        "confidence": "high"
    }

Only chunks that the verified answer actually cites (via [1], [2], ...
markers) are included in "evidence" - this is what keeps the evidence
list honest instead of just dumping every retrieved chunk back out.
"""

import os
import re
from typing import List, Dict, Optional

from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
DEFAULT_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

_client: Optional[Groq] = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        if not GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to your environment "
                "(e.g. a .env file loaded at startup) before calling generate_answer()."
            )
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def _build_context(chunks: List[Dict]) -> str:
    """Turn retrieved chunks into a numbered context block the model can cite."""
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        filename = chunk.get("filename") or chunk.get("source") or "unknown"
        text = chunk.get("text", "")
        parts.append(f"[{i}] (source: {filename})\n{text}")
    return "\n\n".join(parts)


NOT_FOUND_MESSAGE = (
    "The knowledge repository does not contain information to answer this question."
)

DRAFT_SYSTEM_PROMPT = (
    "You are a precise assistant answering questions using ONLY the provided "
    "image/video analysis summary and document excerpts. When the summary is from "
    "a video, treat it as a description of the observed frames and clearly state "
    "what was detected across the sampled footage. When the summary is from an "
    "image, include detection confidence information and qualify any low-confidence "
    "items as possible or tentative observations rather than confirmed compliance. "
    "First explain the visual or video findings, then connect those findings to "
    "the relevant safety rules or compliance requirements from the excerpts. "
    "Answer concisely in 2-4 sentences. Cite the numbered document excerpts, "
    "like [1] or [2], for every claim about rules, requirements, or policy - "
    "an answer about document content with no citation is not acceptable. Do not "
    "invent a citation for anything that comes only from the analysis summary. Do "
    "not say the analysis does or does not mention a topic; instead, describe the "
    "supported findings and applicable rules. Avoid repeating the analysis summary "
    "word-for-word. If none of the document excerpts contain information relevant "
    f"to the question, and the analysis summary alone cannot answer it, respond "
    f"with exactly: \"{NOT_FOUND_MESSAGE}\" and nothing else. Never use outside "
    "or general knowledge to fill the gap."
)

VERIFY_SYSTEM_PROMPT = (
    "You are a strict fact-checker. You will be given an analysis summary, a set "
    "of numbered document excerpts, and a draft answer. Your job is to rewrite "
    "the draft so it is 100% grounded in the analysis summary and excerpts. Apply "
    "these rules:\n"
    "1. Use the analysis summary to support statements about what the image/video "
    "shows, especially the observed video frames when the summary is from a video.\n"
    "2. Use the document excerpts to support statements about rules, requirements, "
    "or policy.\n"
    "3. Do not say the analysis does not mention a topic. Only state what is "
    "directly supported by the analysis summary or excerpts.\n"
    "4. If a claim comes only from the analysis summary, do not assign a document "
    "citation to it.\n"
    "5. If an image detection has low confidence (<50%), phrase it as a tentative "
    "or possible observation rather than a confirmed rule compliance.\n"
    "6. Avoid repeating the analysis summary verbatim; keep it brief and focused.\n"
    "7. Remove any claim not directly supported by either the analysis summary or "
    "the excerpts.\n"
    "8. Keep the answer concise (2-4 sentences) and direct. Output only the "
    "corrected answer text, nothing else.\n"
    f"9. If, after removing unsupported claims, nothing verifiable remains - or "
    f"none of the excerpts actually address the question - output exactly: "
    f"\"{NOT_FOUND_MESSAGE}\" and nothing else. Do not soften this into a vague "
    "or partially-answered response; either it's grounded or it says not found."
)


def _draft_answer(query: str, context: str, analysis_summary: Optional[str], model: Optional[str]) -> str:
    client = _get_client()
    analysis_section = (
        f"Image/Video analysis summary:\n{analysis_summary}\n\n"
        if analysis_summary else ""
    )
    user_prompt = (
        f"{analysis_section}"
        f"Document excerpts:\n\n{context}\n\n"
        f"Question: {query}\n\n"
        "Answer the question using only the analysis summary and excerpts above."
    )
    response = client.chat.completions.create(
        model=model or DEFAULT_MODEL,
        messages=[
            {"role": "system", "content": DRAFT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        max_tokens=512,
    )
    return response.choices[0].message.content.strip()


def _verify_answer(query: str, context: str, draft: str, analysis_summary: Optional[str], model: Optional[str]) -> str:
    client = _get_client()
    analysis_section = (
        f"Image/Video analysis summary:\n{analysis_summary}\n\n"
        if analysis_summary else ""
    )
    user_prompt = (
        f"{analysis_section}"
        f"Document excerpts:\n\n{context}\n\n"
        f"Original question: {query}\n\n"
        f"Draft answer:\n{draft}\n\n"
        "Rewrite the draft answer following your rules."
    )
    response = client.chat.completions.create(
        model=model or DEFAULT_MODEL,
        messages=[
            {"role": "system", "content": VERIFY_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        max_tokens=512,
    )
    return response.choices[0].message.content.strip()


def _extract_section(text: str) -> Optional[str]:
    """
    Best-effort pull of a heading/section label from the top of a chunk,
    e.g. 'SECTION 1: HARDHAT REQUIREMENTS' or a markdown '## Heading' line.
    Returns None if nothing heading-like is found near the start of the chunk.
    """
    if not text:
        return None
    head = text.strip().splitlines()[0].strip()
    # Common patterns: "SECTION 1: ...", "1. ...", "## ...", ALL CAPS lines
    if re.match(r"^(section|chapter|part)\s+\w+", head, re.IGNORECASE):
        return head
    if head.startswith("#"):
        return head.lstrip("#").strip()
    if head.isupper() and 3 <= len(head) <= 80:
        return head
    return None


def _cited_indices(answer_text: str) -> List[int]:
    """Return the sorted, deduped list of [N] citation indices used in the answer."""
    found = re.findall(r"\[(\d+)\]", answer_text)
    seen = []
    for n in found:
        i = int(n)
        if i not in seen:
            seen.append(i)
    return sorted(seen)


def _build_evidence(chunks: List[Dict], cited: List[int]) -> List[Dict]:
    """
    Build the evidence list from only the chunks actually cited in the
    verified answer (1-indexed, matching _build_context's numbering).
    """
    evidence = []
    for i in cited:
        idx = i - 1
        if idx < 0 or idx >= len(chunks):
            continue
        chunk = chunks[idx]
        filename = chunk.get("filename") or chunk.get("source") or "unknown"
        text = chunk.get("text", "")
        section = chunk.get("section") or _extract_section(text)

        score = chunk.get("relevance_score", chunk.get("score", chunk.get("similarity")))
        if isinstance(score, (int, float)):
            pct = score * 100 if score <= 1 else score
            relevance = f"{pct:.0f}%"
        elif isinstance(score, str):
            relevance = score
        else:
            relevance = "N/A"

        excerpt = text.strip()
        if len(excerpt) > 300:
            excerpt = excerpt[:300].rsplit(" ", 1)[0] + "..."

        evidence.append({
            "source": filename,
            "section": section or "N/A",
            "excerpt": excerpt,
            "relevance": relevance,
        })
    return evidence


def generate_answer(
    query: str,
    chunks: List[Dict],
    analysis_summary: Optional[str] = None,
    model: Optional[str] = None,
) -> Dict:
    """
    Generate a grounded answer to `query` using `chunks`.

    chunks: list of dicts, each expected to have at least a "text" key
            and ideally "filename"/"source" (+ optionally "section" and
            "score"/"similarity") for attribution - this matches the shape
            returned by vector_store.search_documents.

    Runs a draft pass then a strict verify/rewrite pass that strips out any
    wording or claim not literally backed by the excerpts, then extracts
    which excerpts were actually cited to build a structured evidence list.

    Returns a dict:
        {
            "answer": str,
            "evidence": [ {source, section, excerpt, relevance}, ... ],
            "grounded": bool,
            "confidence": "high" | "medium" | "low"
        }

    This function never raises - Groq failures or empty retrieval produce
    a graceful fallback dict, so it's safe to call directly from a route
    handler.
    """
    if not chunks:
        return {
            "answer": "No relevant content was found in the knowledge repository to answer this.",
            "evidence": [],
            "grounded": False,
            "confidence": "low",
        }

    context = _build_context(chunks)

    try:
        draft = _draft_answer(query, context, analysis_summary, model)
        verified = _verify_answer(query, context, draft, analysis_summary, model)

        cited = _cited_indices(verified)
        evidence = _build_evidence(chunks, cited)

        grounded = len(evidence) > 0
        if not grounded:
            confidence = "low"
        elif len(evidence) >= 2:
            confidence = "high"
        else:
            confidence = "medium"

        if not grounded and NOT_FOUND_MESSAGE not in verified:
            verified = NOT_FOUND_MESSAGE

        return {
            "answer": verified,
            "evidence": evidence,
            "grounded": grounded,
            "confidence": confidence,
        }
    except Exception as e:
        return {
            "answer": f"Couldn't generate an answer right now ({str(e)}).",
            "evidence": [],
            "grounded": False,
            "confidence": "low",
        }