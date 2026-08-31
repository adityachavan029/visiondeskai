import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { ArrowRight, Eye, BookOpen, Bot, ShieldCheck, Play, CheckCircle2, Terminal, Sparkles, Layers, Cpu, Check, Activity, ChevronRight } from 'lucide-react';

export default function LandingPage({ onLaunchWorkstation, theme }) {
  const isDark = theme === 'dark';

  const [activeCategory, setActiveCategory] = useState('all');
  const [simStep, setSimStep] = useState(1);
  const [simRunning, setSimRunning] = useState(false);

  const handleSimulate = () => {
    setSimRunning(true);
    setSimStep(1);
    let step = 1;
    const interval = setInterval(() => {
      step += 1;
      setSimStep(step);
      if (step >= 4) {
        clearInterval(interval);
        setSimRunning(false);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ffffff', '#a1a1aa', '#71717a'],
        });
      }
    }, 1200);
  };

  const showcaseCards = [
    {
      id: 'vision-01',
      category: 'vision',
      title: 'Real-Time YOLOv8 PPE Inspector',
      desc: 'Instant neural bounding box identification for hardhats, safety vests, masks, and fall hazards.',
      tag: 'VISION ENGINE',
      metric: '0.18s Inference',
      previewType: 'image',
    },
    {
      id: 'rag-02',
      category: 'knowledge',
      title: 'Vector Store Regulation Query',
      desc: 'Semantic retrieval across company PDFs, OSHA standards, and site safety manuals via ChromaDB.',
      tag: 'VECTOR RAG',
      metric: 'Top-5 Semantic Match',
      previewType: 'rag',
    },
    {
      id: 'agent-03',
      category: 'agent',
      title: 'Autonomous 6-Agent LangGraph Pipeline',
      desc: 'End-to-end multi-agent orchestration: Query Analysis -> Visual Detection -> RAG Retrieval -> Reasoning -> Executive Report.',
      tag: 'MULTI-AGENT',
      metric: 'Human-in-the-Loop',
      previewType: 'agent',
    },
    {
      id: 'video-04',
      category: 'vision',
      title: 'Video Stream Sampling & Violations',
      desc: 'Frame-by-frame temporal evaluation for heavy machinery sites, tracking compliance over time.',
      tag: 'STREAM ANALYTICS',
      metric: 'Full Temporal Scan',
      previewType: 'video',
    },
  ];

  const filteredCards = activeCategory === 'all'
    ? showcaseCards
    : showcaseCards.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-24 py-6">
      
      {/* 1. Hero Section (Mobbin Minimalist Style) */}
      <section className="relative pt-8 pb-12 flex flex-col items-center text-center space-y-8">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-zinc-500/5 dark:bg-zinc-400/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Status Capsule */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md text-xs font-mono"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">VISIONDESK AI 2.0 ENTERPRISE RELEASE</span>
          <span className="text-zinc-400 dark:text-zinc-600">|</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-semibold">100% AUDIT READY</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight leading-[1.08] text-zinc-900 dark:text-zinc-50">
            Industrial Safety Intelligence. <br />
            <span className="text-zinc-500 dark:text-zinc-400 font-light">Precision at scale.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
            Unifying real-time YOLO vision inspection, vector regulation retrieval, and 6-agent autonomous compliance workflows into a single monochrome workstation.
          </p>
        </motion.div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Button
            data-cursor="LAUNCH"
            size="lg"
            variant="default"
            onClick={() => {
              confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
              onLaunchWorkstation();
            }}
            className="flex items-center space-x-2 text-xs font-mono"
          >
            <span>Launch Studio Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            data-cursor="SIMULATE"
            size="lg"
            variant="secondary"
            onClick={handleSimulate}
            className="flex items-center space-x-2 text-xs font-mono"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Case Workflow</span>
          </Button>
        </motion.div>

        {/* Telemetry Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-5xl pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left"
        >
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
            <p className="text-xs font-mono text-zinc-500 uppercase">YOLO INFERENCE</p>
            <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">0.18s</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Sub-second bounding box scan</p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
            <p className="text-xs font-mono text-zinc-500 uppercase">CHROMADB VECTOR</p>
            <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">Top-5 RAG</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Semantic document matching</p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
            <p className="text-xs font-mono text-zinc-500 uppercase">LANGGRAPH AGENTS</p>
            <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">6 Steps</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Autonomous investigation pipeline</p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
            <p className="text-xs font-mono text-zinc-500 uppercase">HUMAN REVIEW</p>
            <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">100% HITL</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Approve, edit, or reject drafts</p>
          </div>
        </motion.div>

      </section>

      {/* 2. Interactive Workflow Simulator Demo */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-2">LIVE SIMULATION</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
              Autonomous Investigation Workflow Simulator
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-sans">
              Watch how our 6-agent pipeline processes media, queries regulations, and drafts executive compliance reports.
            </p>
          </div>

          <Button
            data-cursor="RUN"
            onClick={handleSimulate}
            disabled={simRunning}
            variant="secondary"
            className="self-start md:self-auto font-mono text-xs"
          >
            {simRunning ? (
              <span className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Simulating Step 0{simStep}...</span>
              </span>
            ) : (
              <span>Re-run Simulation</span>
            )}
          </Button>
        </div>

        {/* Step Progress Container */}
        <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d12]/90 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 transition-all ${
              simStep >= 1 ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}>
              <div className="flex justify-between items-center text-[10px]">
                <span>STEP 01</span>
                {simStep >= 1 && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className="font-bold">Media Upload</p>
              <p className="text-[10px] text-zinc-500">Site JPEG loaded</p>
            </div>

            <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 transition-all ${
              simStep >= 2 ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}>
              <div className="flex justify-between items-center text-[10px]">
                <span>STEP 02</span>
                {simStep >= 2 && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className="font-bold">YOLO Scan</p>
              <p className="text-[10px] text-zinc-500">2 PPE objects detected</p>
            </div>

            <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 transition-all ${
              simStep >= 3 ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}>
              <div className="flex justify-between items-center text-[10px]">
                <span>STEP 03</span>
                {simStep >= 3 && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className="font-bold">Vector RAG</p>
              <p className="text-[10px] text-zinc-500">OSHA 1926.100 matched</p>
            </div>

            <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 transition-all ${
              simStep >= 4 ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}>
              <div className="flex justify-between items-center text-[10px]">
                <span>STEP 04</span>
                {simStep >= 4 && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className="font-bold">Executive Report</p>
              <p className="text-[10px] text-zinc-500">Draft ready for review</p>
            </div>
          </div>

          {/* Simulated Executive Report Box */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="text-zinc-900 dark:text-zinc-100 font-bold flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>SIMULATED EXECUTIVE COMPLIANCE REPORT</span>
              </span>
              <Badge variant="monochrome">SEVERITY: MODERATE</Badge>
            </div>

            {simStep < 4 ? (
              <div className="py-8 text-center text-zinc-400 space-y-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Executing agentic analysis sequence...</p>
              </div>
            ) : (
              <div className="space-y-2 text-zinc-700 dark:text-zinc-300 animate-fadeIn">
                <p className="font-bold text-zinc-900 dark:text-zinc-100"># Executive Safety Summary</p>
                <p>Visual inspection detected worker operating without mandated head protection on Scaffolding Tower B.</p>
                <p className="text-zinc-500 font-semibold">• Referenced Policy: OSHA 1926.100 (Head Protection Equipment)</p>
                <p className="text-zinc-500 font-semibold">• Corrective Action: Issue immediate site warning & provide hardhat.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. Mobbin-Style Showcase Grid */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-2">CAPABILITIES GRID</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
              Mobbin-Grade Component Architecture
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-sans">
              Explore the core engine components powering the VisionDesk AI workstation.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80">
            {['all', 'vision', 'knowledge', 'agent'].map((cat) => (
              <button
                key={cat}
                data-cursor="FILTER"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {cat === 'all' ? 'ALL' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="group cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{card.tag}</Badge>
                  <span className="text-[11px] font-mono text-zinc-500 font-semibold">{card.metric}</span>
                </div>
                <CardTitle className="group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription>{card.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-44 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950/90 p-4 flex flex-col justify-between font-mono text-xs text-zinc-400 overflow-hidden relative group-hover:border-zinc-600 transition-colors">
                  
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2 text-[10px]">
                    <span className="text-zinc-300 font-bold">SYSTEM WORKSPACE PREVIEW</span>
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>LIVE</span>
                    </span>
                  </div>

                  {card.previewType === 'image' && (
                    <div className="space-y-2 my-auto">
                      <div className="flex justify-between text-[11px] text-zinc-200 font-bold">
                        <span>DETECTIONS: 2 OBJECTS</span>
                        <span className="text-amber-400 font-mono">NO-Hardhat (89%)</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-zinc-200 h-full w-[89%]" />
                      </div>
                    </div>
                  )}

                  {card.previewType === 'rag' && (
                    <div className="space-y-1.5 my-auto text-[11px]">
                      <p className="text-zinc-300 font-bold">Query: "OSHA construction helmet standard"</p>
                      <p className="text-zinc-500 italic">"OSHA 1926.100 mandates protective helmets in areas of potential head injury."</p>
                    </div>
                  )}

                  {card.previewType === 'agent' && (
                    <div className="space-y-1.5 my-auto text-[11px]">
                      <p className="text-zinc-200 font-bold">Agent Flow: Step 04 / Reasoning</p>
                      <p className="text-zinc-400">Synthesizing evidence and drafting severity status...</p>
                    </div>
                  )}

                  {card.previewType === 'video' && (
                    <div className="space-y-1.5 my-auto text-[11px]">
                      <p className="text-zinc-200 font-bold">Video Stream Sample: 48 Frames</p>
                      <p className="text-zinc-400">Violations Flagged: 3 Frames</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-zinc-800 text-[10px] text-zinc-500">
                    <span className="flex items-center space-x-1 group-hover:text-zinc-200 transition-colors">
                      <span>Inspect Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </section>

      {/* 4. Bottom CTA Launch Station */}
      <section className="p-8 sm:p-12 rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-center space-y-6">
        <Badge variant="monochrome" className="mx-auto">READY TO DEPLOY</Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-zinc-900 dark:text-zinc-50">
          Enter the VisionDesk AI Studio Workstation
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans">
          Access all four compliance modules, upload site media, query regulations, and review AI reports.
        </p>

        <Button
          data-cursor="WORKSTATION"
          size="lg"
          variant="default"
          onClick={() => {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.8 } });
            onLaunchWorkstation();
          }}
          className="mx-auto flex items-center space-x-2 text-xs font-mono"
        >
          <span>Open Studio Workstation</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </section>

    </div>
  );
}
