import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/50 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="PixelKit Home" className="flex items-center">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Quick links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <Link
              href="/compressor"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Compressor
            </Link>
            <Link
              href="/resizer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Resizer
            </Link>
            <Link
              href="/converter"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Converter
            </Link>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Client-Side • All processing performed locally in your browser</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <span>© {new Date().getFullYear()} PixelKit. Free & open browser utility.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
