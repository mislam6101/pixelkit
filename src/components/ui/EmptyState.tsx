import React from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center transition-colors dark:border-slate-800',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-3">
        {icon || <ImageIcon className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h4>
      {description && (
        <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
