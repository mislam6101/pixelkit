import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, prefixElement, suffixElement, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixElement && (
            <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
              {prefixElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500',
              prefixElement ? 'pl-9' : 'pl-3',
              suffixElement ? 'pr-12' : 'pr-3',
              error
                ? 'border-rose-500 focus-visible:ring-rose-500 dark:border-rose-500'
                : '',
              className
            )}
            {...props}
          />
          {suffixElement && (
            <div className="pointer-events-none absolute right-3 flex items-center text-xs font-medium text-slate-400">
              {suffixElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
