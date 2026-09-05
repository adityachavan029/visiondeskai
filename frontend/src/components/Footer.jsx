import React from 'react';
import { ScanFace } from 'lucide-react';

export default function Footer({ theme }) {
  const isDark = theme === 'dark';

  return (
    <footer className={`mt-20 border-t py-10 px-4 text-xs font-mono transition-colors ${
      isDark ? 'border-zinc-800/80 bg-[#09090b] text-zinc-500' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left */}
        <div className="flex items-center space-x-2">
          <ScanFace className="w-4 h-4 text-emerald-500" />
          <span className={`font-bold font-heading ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>VISIONDESK.AI</span>
          <span>• Safety Intelligence Studio</span>
        </div>

        {/* Right */}
        <div>
          <span>Made with ❤️ by <a href="https://github.com/adityachavan029/visiondeskai" target="_blank" rel="noreferrer" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">Team D</a></span>
        </div>

      </div>
    </footer>
  );
}
