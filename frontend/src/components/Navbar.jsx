import React from 'react';
import { Eye, User, LogOut, Activity, Lock, Sun, Moon, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
}) {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 border-b ${
      isDark ? 'bg-[#09090b]/90 border-zinc-800 text-zinc-100' : 'bg-white/90 border-zinc-200 text-zinc-900'
    } backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          data-cursor="HOME"
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
          onClick={() => setViewMode('landing')}
        >
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-colors ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 group-hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-900 group-hover:border-zinc-400'
          }`}>
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold text-sm sm:text-base font-heading tracking-tight">
                VISIONDESK<span className="text-zinc-500 font-light">.AI</span>
              </span>
              <Badge variant="monochrome" className="text-[9px] px-1.5 py-0">v2.0</Badge>
            </div>
          </div>
        </div>

        {/* View Switcher: Landing vs Workstation */}
        <div className="flex items-center space-x-1 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90">
          <button
            data-cursor="HOME"
            onClick={() => setViewMode('landing')}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-medium transition-all ${
              viewMode === 'landing'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Landing
          </button>
          <button
            data-cursor="STUDIO"
            onClick={() => setViewMode('workstation')}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-medium transition-all ${
              viewMode === 'workstation'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Workstation
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Server Telemetry Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <Activity className={`w-3.5 h-3.5 ${serverStatus === 'online' ? 'text-emerald-500' : 'text-amber-500 animate-spin'}`} />
            <span>{serverStatus === 'online' ? 'API Online' : 'Connecting'}</span>
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
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono text-zinc-800 dark:text-zinc-300">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{user.name || user.email}</span>
              </div>
              <Button
                data-cursor="LOGOUT"
                variant="outline"
                size="icon"
                onClick={onLogout}
                title="Log Out"
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
              <Lock className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Login</span>
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}
