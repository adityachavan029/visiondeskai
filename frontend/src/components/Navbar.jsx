import React, { useState } from 'react';
import {
  Eye, User, LogOut, Activity, Lock, Sun, Moon,
  Globe, Menu, X, ShieldCheck, BookOpen, Bot, Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getTranslation } from '../lib/translations';

export default function Navbar({
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  serverStatus,
  theme,
  toggleTheme,
  language = 'en',
  setLanguage,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const isDark = theme === 'dark';
  const t = (key) => getTranslation(language, key);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setViewMode('workstation');
    setMobileMenuOpen(false);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 border-b ${
      isDark ? 'bg-[#09090b]/90 border-zinc-800 text-zinc-100' : 'bg-white/90 border-zinc-200 text-zinc-900'
    } backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <div
          data-cursor="HOME"
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
          onClick={() => handleViewChange('landing')}
        >
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-colors ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 group-hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-900 group-hover:border-zinc-400'
          }`}>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold text-sm sm:text-base font-heading tracking-tight">
                {language === 'hi' ? 'विज़नडेस्क' : 'VISIONDESK'}<span className="text-zinc-500 font-light">.AI</span>
              </span>
              <Badge variant="monochrome" className="text-[9px] px-1.5 py-0">v2.0</Badge>
            </div>
          </div>
        </div>

        {/* Center: Desktop View Switcher */}
        <div className="hidden md:flex items-center space-x-1 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90">
          <button
            data-cursor="HOME"
            onClick={() => handleViewChange('landing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              viewMode === 'landing'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            {t('landing')}
          </button>
          <button
            data-cursor="STUDIO"
            onClick={() => handleViewChange('workstation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              viewMode === 'workstation'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            {t('workstation')}
          </button>
        </div>

        {/* Right Section: Desktop Controls */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
          
          {/* Server Telemetry Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <Activity className={`w-3.5 h-3.5 ${serverStatus === 'online' ? 'text-emerald-500' : 'text-amber-500 animate-spin'}`} />
            <span>{serverStatus === 'online' ? t('apiOnline') : t('connecting')}</span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold">{language === 'hi' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {langDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-36 py-1.5 rounded-2xl border shadow-xl z-50 text-xs font-mono ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <button
                  onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    language === 'en' ? 'font-bold text-emerald-500' : ''
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    language === 'hi' ? 'font-bold text-emerald-500' : ''
                  }`}
                >
                  <span>हिन्दी</span>
                  {language === 'hi' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            data-cursor="THEME"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono text-zinc-800 dark:text-zinc-300">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{user.name || user.email}</span>
              </div>
              <Button
                data-cursor="LOGOUT"
                variant="outline"
                size="icon"
                onClick={onLogout}
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              data-cursor="SIGN IN"
              variant="default"
              size="sm"
              onClick={onOpenAuth}
              className="font-mono text-xs"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              <span>{t('signIn')}</span>
            </Button>
          )}

        </div>

        {/* Mobile Right Controls (Toggle Language & Hamburger Menu Button) */}
        <div className="flex items-center space-x-2 md:hidden">
          {/* Mobile Quick Language Button */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1 ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-zinc-100 border-zinc-300 text-emerald-600'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'HI' : 'EN'}</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
            }`}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Redesigned Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 py-6 space-y-5 transition-all shadow-2xl animate-in slide-in-from-top-4 duration-200 ${
          isDark ? 'bg-[#09090b] border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
          
          {/* 1. Landing vs Workstation Switcher */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Mode</span>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90">
              <button
                onClick={() => handleViewChange('landing')}
                className={`py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                  viewMode === 'landing'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {t('landing')}
              </button>
              <button
                onClick={() => handleViewChange('workstation')}
                className={`py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                  viewMode === 'workstation'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {t('workstation')}
              </button>
            </div>
          </div>

          {/* 2. Workstation Modules (When in Workstation view mode) */}
          {viewMode === 'workstation' && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Workstation Modules</span>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => handleTabClick('vision')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                    activeTab === 'vision'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-transparent'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">{t('visionInspector')}</span>
                </button>

                <button
                  onClick={() => handleTabClick('knowledge')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                    activeTab === 'knowledge'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-transparent'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="truncate">{t('knowledgeHub')}</span>
                </button>

                <button
                  onClick={() => handleTabClick('agent')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                    activeTab === 'agent'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-transparent'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Bot className="w-4 h-4 text-violet-500" />
                  <span className="truncate">{t('aiInvestigation')}</span>
                </button>

                <button
                  onClick={() => handleTabClick('dashboard')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-transparent'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">{t('safetyDashboard')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Settings & Controls (Language & Theme) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            {/* Language Switch */}
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{t('language')}</span>
              <div className="flex items-center p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all ${
                    language === 'en'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all ${
                    language === 'hi'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Theme Switch */}
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{t('theme')}</span>
              <button
                onClick={toggleTheme}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between transition-colors ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                }`}
              >
                <span>{isDark ? t('darkMode') : t('lightMode')}</span>
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
              </button>
            </div>
          </div>

          {/* 4. Auth & Status */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Status:</span>
              <span className="flex items-center space-x-1.5 font-bold text-emerald-500">
                <Activity className="w-3.5 h-3.5" />
                <span>{serverStatus === 'online' ? t('apiOnline') : t('connecting')}</span>
              </span>
            </div>

            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <User className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-zinc-900 dark:text-zinc-200">{user.name || user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span>{t('logout')}</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                className="w-full font-mono text-xs py-2.5"
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              >
                <Lock className="w-4 h-4 mr-2" />
                <span>{t('signIn')}</span>
              </Button>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
