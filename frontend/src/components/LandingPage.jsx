import React from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, Eye, BookOpen, Bot, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { getTranslation } from '../lib/translations';

export default function LandingPage({ onLaunchWorkstation, theme, language = 'en' }) {
  const isDark = theme === 'dark';
  const t = (key) => getTranslation(language, key);

  const handleLaunch = (targetTab = 'vision') => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.75 },
      colors: isDark ? ['#10b981', '#3b82f6', '#8b5cf6'] : ['#059669', '#2563eb', '#7c3aed'],
    });
    onLaunchWorkstation(targetTab);
  };

  const pillars = [
    {
      icon: Eye,
      color: 'emerald',
      titleKey: 'card1Title',
      descKey: 'card1Desc',
      tab: 'vision',
    },
    {
      icon: BookOpen,
      color: 'blue',
      titleKey: 'card2Title',
      descKey: 'card2Desc',
      tab: 'knowledge',
    },
    {
      icon: Bot,
      color: 'violet',
      titleKey: 'card3Title',
      descKey: 'card3Desc',
      tab: 'agent',
    },
    {
      icon: ShieldCheck,
      color: 'amber',
      titleKey: 'card4Title',
      descKey: 'card4Desc',
      tab: 'dashboard',
    },
  ];

  const modules = [
    {
      id: 'vision',
      icon: Eye,
      titleKey: 'visionInspector',
      descKey: 'visionModDesc',
      badge: 'YOLOv8 Vision',
      accent: 'emerald',
    },
    {
      id: 'knowledge',
      icon: BookOpen,
      titleKey: 'knowledgeHub',
      descKey: 'knowledgeModDesc',
      badge: 'Chroma Vector RAG',
      accent: 'blue',
    },
    {
      id: 'agent',
      icon: Bot,
      titleKey: 'aiInvestigation',
      descKey: 'agentModDesc',
      badge: '6-Agent LangGraph',
      accent: 'violet',
    },
    {
      id: 'dashboard',
      icon: ShieldCheck,
      titleKey: 'safetyDashboard',
      descKey: 'dashboardModDesc',
      badge: 'Telemetry & Analytics',
      accent: 'amber',
    },
  ];

  const metrics = [
    { valKey: 'stat1Val', labelKey: 'stat1Label' },
    { valKey: 'stat2Val', labelKey: 'stat2Label' },
    { valKey: 'stat3Val', labelKey: 'stat3Label' },
    { valKey: 'stat4Val', labelKey: 'stat4Label' },
  ];

  return (
    <div className="space-y-20 sm:space-y-32 py-6 sm:py-12 max-w-7xl mx-auto">
      
      {/* 1. Hero Section (Hyperveda Style) */}
      <section className="relative pt-8 sm:pt-16 pb-12 sm:pb-20 flex flex-col items-center text-center space-y-8 sm:space-y-10">
        
        {/* Glowing Background Radial Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[250px] sm:h-[400px] bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Floating Top Badge Capsule */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border backdrop-blur-md text-xs font-mono transition-all ${
            isDark
              ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
              : 'bg-zinc-100/90 border-zinc-300 text-zinc-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-[11px]">{t('heroBadge')}</span>
        </motion.div>

        {/* Dual-Tone Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl space-y-4 px-2"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight leading-[1.1]">
            <span className={isDark ? 'text-white' : 'text-zinc-950'}>
              {t('heroTitleMain')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
              {t('heroTitleSub')}
            </span>
          </h1>
          
          <p className={`max-w-2xl mx-auto text-sm sm:text-base font-sans leading-relaxed pt-2 ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            {t('heroSubtitle')}
          </p>
        </motion.div>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none pt-2"
        >
          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-mono text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2.5"
          >
            <span>{t('ctaPrimary')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLaunch}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-mono text-xs font-semibold border transition-all flex items-center justify-center space-x-2 ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                : 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 shadow-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('ctaSecondary')}</span>
          </button>
        </motion.div>

      </section>

      {/* 2. Core Pillars ("Why Choose VisionDesk AI?") */}
      <section className="space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
            <span>{t('pillarsBadge')}</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold font-heading ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            {t('pillarsHeading1')}{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              {t('pillarsHeading2')}
            </span>
          </h2>
          <div className="w-12 h-1 bg-emerald-500 rounded-full mx-auto" />
          <p className={`max-w-2xl mx-auto text-xs sm:text-sm font-sans ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t('pillarsDesc')}
          </p>
        </div>

        {/* 4-Card Pillar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => handleLaunch(item.tab)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${
                  isDark
                    ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xl shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <h3 className={`text-lg font-bold font-heading ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    {t(item.titleKey)}
                  </h3>

                  <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {t(item.descKey)}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-500 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Module</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* 3. Enterprise Module Showcase */}
      <section className="space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono border border-blue-500/30 text-blue-500 bg-blue-500/10">
            <span>{t('showcaseBadge')}</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold font-heading ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            {t('showcaseHeading1')}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
              {t('showcaseHeading2')}
            </span>
          </h2>
          <p className={`max-w-2xl mx-auto text-xs sm:text-sm font-sans ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t('showcaseDesc')}
          </p>
        </div>

        {/* 4 Showcase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, idx) => {
            const ModIcon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => handleLaunch(mod.id)}
                className={`p-6 sm:p-8 rounded-3xl border cursor-pointer transition-all duration-300 group hover:-translate-y-1 ${
                  isDark
                    ? 'bg-zinc-900/50 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/90'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-2xl shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  }`}>
                    <ModIcon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}>
                    {mod.badge}
                  </span>
                </div>

                <h3 className={`text-xl font-bold font-heading mb-2 group-hover:text-emerald-500 transition-colors ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}>
                  {t(mod.titleKey)}
                </h3>

                <p className={`text-xs sm:text-sm font-sans leading-relaxed mb-6 ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {t(mod.descKey)}
                </p>

                <div className="flex items-center text-xs font-mono font-bold text-emerald-500 group-hover:underline">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* 4. Key Performance Metrics Bar */}
      <section className={`p-8 sm:p-12 rounded-3xl border ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200 shadow-sm'
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          {metrics.map((m, idx) => (
            <div key={idx} className={`space-y-1 ${idx > 0 ? 'pt-4 md:pt-0' : ''}`}>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                {t(m.valKey)}
              </div>
              <div className={`text-xs font-mono font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                {t(m.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Clean CTA Callout Banner */}
      <section className="relative overflow-hidden p-8 sm:p-16 rounded-3xl border text-center space-y-8 bg-gradient-to-b from-emerald-950/20 to-zinc-900/90 dark:from-emerald-950/40 dark:to-[#09090b] border-emerald-500/20 shadow-2xl">
        
        <div className="max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-[10px] uppercase">
            {t('heroBadge')}
          </Badge>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
            {t('ctaHeading1')}{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {t('ctaHeading2')}
            </span>
          </h2>
          
          <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-xl mx-auto">
            {t('ctaDesc')}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleLaunch}
            className="px-10 py-4 rounded-full font-mono text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.03] transition-all inline-flex items-center space-x-3"
          >
            <span>{t('ctaButton')}</span>
            <Zap className="w-4 h-4 fill-current" />
          </button>
        </div>

      </section>

    </div>
  );
}
