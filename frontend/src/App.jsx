import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import VisionInspector from './components/VisionInspector';
import KnowledgeHub from './components/KnowledgeHub';
import InvestigationEngine from './components/InvestigationEngine';
import Footer from './components/Footer';
import { Eye, BookOpen, Bot } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' or 'workstation'
  const [activeTab, setActiveTab] = useState('vision'); // 'vision', 'knowledge', 'agent'
  
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState('connecting');
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {viewMode === 'landing' ? (
          <LandingPage
            theme={theme}
            onLaunchWorkstation={() => setViewMode('workstation')}
          />
        ) : (
          <div className="py-8 space-y-6">
            
            {/* Workstation Module Tabs Bar */}
            <div className="flex items-center justify-between p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono">
              <div className="flex items-center space-x-1">
                <button
                  data-cursor="VISION"
                  onClick={() => setActiveTab('vision')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'vision'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Vision Inspector</span>
                </button>

                <button
                  data-cursor="KNOWLEDGE"
                  onClick={() => setActiveTab('knowledge')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'knowledge'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Knowledge Hub</span>
                </button>

                <button
                  data-cursor="AGENTS"
                  onClick={() => setActiveTab('agent')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'agent'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Investigation</span>
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 hidden sm:block">
                STUDIO WORKSTATION ACTIVE
              </div>
            </div>

            {/* Active Studio Component */}
            <div>
              {activeTab === 'vision' && <VisionInspector theme={theme} />}
              {activeTab === 'knowledge' && <KnowledgeHub theme={theme} />}
              {activeTab === 'agent' && <InvestigationEngine theme={theme} />}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer theme={theme} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
        theme={theme}
      />

    </div>
  );
}
