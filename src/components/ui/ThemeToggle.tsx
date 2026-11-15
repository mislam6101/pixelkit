'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        mounted
          ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
          : 'Toggle theme'
      }
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        className
      )}
    >
      {mounted && theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform duration-200 rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
}
