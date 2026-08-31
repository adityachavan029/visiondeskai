import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-3xl border transition-all duration-300',
        'bg-white border-zinc-200/80 shadow-sm text-zinc-900',
        'dark:bg-[#0c0d12]/90 dark:border-zinc-800/80 dark:text-zinc-100 dark:shadow-none',
        'hover:border-zinc-400 dark:hover:border-zinc-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return <div className={cn('p-6 pb-3 flex flex-col space-y-1.5', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('text-lg font-bold font-heading tracking-tight', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }) {
  return <p className={cn('text-xs text-zinc-500 dark:text-zinc-400 font-sans', className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }) {
  return <div className={cn('p-6 pt-0 flex items-center', className)} {...props}>{children}</div>;
}
