import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import VisionInspector from './components/VisionInspector';
import KnowledgeHub from './components/KnowledgeHub';
import InvestigationEngine from './components/InvestigationEngine';
import SafetyDashboard from './components/SafetyDashboard';
import Footer from './components/Footer';
import { Eye, BookOpen, Bot, ShieldCheck } from 'lucide-react';
import { getTranslation } from './lib/translations';
import axios from 'axios';

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' or 'workstation'
  const [activeTab, setActiveTab] = useState('vision'); // 'vision', 'knowledge', 'agent', 'dashboard'
  
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState('connecting');
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => getTranslation(language, key);

  // Lenis Smooth Kinetic Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    const checkServer = async () => {
      try {
        await axios.get('/api/model-info');
        setServerStatus('online');
      } catch (err) {
        setServerStatus('error');
      }
    };
    checkServer();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#ffffff] text-zinc-900'
    }`}>
      
      {/* Precision Monochrome Magnetic Cursor */}
      <CustomCursor theme={theme} />

      {/* Header Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        serverStatus={serverStatus}
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {viewMode === 'landing' ? (
          <LandingPage
            theme={theme}
            language={language}
            onLaunchWorkstation={() => setViewMode('workstation')}
          />
        ) : (
          <div className="py-8 space-y-6">
            
            {/* Workstation Module Tabs Bar (Responsive Grid / Horizontal Scroll) */}
            <div className="flex items-center justify-between p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono">
              <div className="flex items-center space-x-1 overflow-x-auto max-w-full no-scrollbar py-0.5">
                <button
                  data-cursor="VISION"
                  onClick={() => setActiveTab('vision')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'vision'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <span>{t('visionInspector')}</span>
                </button>

                <button
                  data-cursor="KNOWLEDGE"
                  onClick={() => setActiveTab('knowledge')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'knowledge'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>{t('knowledgeHub')}</span>
                </button>

                <button
                  data-cursor="AGENTS"
                  onClick={() => setActiveTab('agent')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'agent'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Bot className="w-4 h-4 text-violet-500" />
                  <span>{t('aiInvestigation')}</span>
                </button>

                <button
                  data-cursor="DASHBOARD"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t('safetyDashboard')}</span>
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 hidden lg:block font-bold">
                {t('studioActive')}
              </div>
            </div>

            {/* Active Studio Component */}
            <div>
              {activeTab === 'vision' && <VisionInspector theme={theme} language={language} />}
              {activeTab === 'knowledge' && <KnowledgeHub theme={theme} language={language} />}
              {activeTab === 'agent' && <InvestigationEngine theme={theme} language={language} />}
              {activeTab === 'dashboard' && <SafetyDashboard theme={theme} language={language} />}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer theme={theme} language={language} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
        theme={theme}
        language={language}
      />

    </div>
  );
}
