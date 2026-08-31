import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-mono font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-xl';
  
  const variants = {
    default: 'bg-zinc-100 text-zinc-950 hover:bg-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-sm font-semibold',
    secondary: 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/80 hover:bg-zinc-800 hover:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800',
    outline: 'border border-zinc-300 bg-transparent hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white',
    ghost: 'hover:bg-zinc-100 text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
    destructive: 'bg-rose-900/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/70',
    success: 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/70',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-xs',
    sm: 'h-8 px-3 text-[11px]',
    lg: 'h-12 px-6 text-sm',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
