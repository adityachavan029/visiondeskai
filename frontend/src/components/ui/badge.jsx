import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wide uppercase border transition-colors';
  
  const variants = {
    default: 'bg-zinc-100 border-zinc-300 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300',
    outline: 'border-zinc-300 text-zinc-800 dark:border-zinc-800 dark:text-zinc-300 bg-white dark:bg-transparent',
    secondary: 'bg-zinc-200 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100',
    monochrome: 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 font-bold',
    warning: 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-300',
    danger: 'bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-300',
    success: 'bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-300',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
