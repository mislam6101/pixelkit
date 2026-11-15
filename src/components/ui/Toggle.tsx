import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'toggle-switch');

  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer select-none',
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
