import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label, className, ...props }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      role="status"
      className={cn('inline-flex items-center gap-2 text-blue-600 dark:text-blue-400', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizes[size])} aria-hidden="true" />
      {label && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
}
