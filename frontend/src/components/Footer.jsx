import React from 'react';
import { Shield, Cpu, Activity } from 'lucide-react';

export default function Footer({ theme }) {
  const isDark = theme === 'dark';

  return (
    <footer className={`mt-20 border-t py-10 px-4 text-xs font-mono transition-colors ${
      isDark ? 'border-zinc-800/80 bg-[#09090b] text-zinc-500' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left */}
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-zinc-400" />
          <span className={`font-bold font-heading ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>VISIONDESK.AI</span>
          <span>• Enterprise Safety Intelligence Studio</span>
        </div>

        {/* Center */}
        <div className="flex items-center space-x-4 text-[11px]">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>YOLOv8 Core</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>ChromaDB Vector Store</span>
          </span>
        </div>

        {/* Right */}
        <div>
          <span>Made with ❤️ by Team <a href="https://github.com/adityachavan029/visiondeskai">D</a></span>
        </div>

      </div>
    </footer>
  );
}
