import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = 'info',
  title,
  children,
  onDismiss,
  ...props
}: AlertProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />,
  };

  const variants = {
    info: 'bg-blue-50/80 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200',
    success: 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200',
    warning: 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200',
    error: 'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-200',
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 text-sm transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="pt-0.5">{icons[variant]}</div>
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
