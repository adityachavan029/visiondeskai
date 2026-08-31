import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-mono font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-xl select-none';
  
  const variants = {
    default: 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-sm font-semibold',
    secondary: 'bg-zinc-100 text-zinc-900 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800',
    outline: 'border border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:bg-transparent dark:hover:bg-zinc-900 dark:hover:text-white',
    ghost: 'hover:bg-zinc-200/60 text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800/60 dark:hover:bg-rose-900/80',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/60 dark:hover:bg-emerald-900/80',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-xs',
    sm: 'h-8 px-3 text-[11px]',
    lg: 'h-11 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm',
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
