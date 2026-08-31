import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase border transition-colors';
  
  const variants = {
    default: 'bg-zinc-800/80 border-zinc-700 text-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300',
    outline: 'border-zinc-300 text-zinc-700 dark:border-zinc-800 dark:text-zinc-400',
    secondary: 'bg-zinc-100 border-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100',
    monochrome: 'bg-zinc-900 text-zinc-100 border-zinc-700 dark:bg-white dark:text-zinc-950 dark:border-white font-bold',
    warning: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
    danger: 'bg-rose-950/40 border-rose-800/60 text-rose-300',
    success: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
