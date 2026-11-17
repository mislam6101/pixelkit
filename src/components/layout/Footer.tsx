'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { ShieldCheck, Settings, Mail, Phone, ExternalLink } from 'lucide-react';
import { openPrivacySettings } from '@/components/analytics/PrivacySettingsModal';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/50 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top row: Brand & navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="PhotoKit Home" className="flex items-center">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
            <Link
              href="/compressor/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Compressor
            </Link>
            <Link
              href="/resizer/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Resizer
            </Link>
            <Link
              href="/converter/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Converter
            </Link>
            <Link
              href="/about/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/terms/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy-policy/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={openPrivacySettings}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer inline-flex items-center gap-1 text-slate-500"
            >
              <Settings className="w-3 h-3" />
              <span>Privacy Settings</span>
            </button>
          </nav>
        </div>

        {/* Middle row: Direct Publisher Contact */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <span>Publisher: <strong>Md. Mahmudul Islam</strong></span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a
              href="mailto:m.islam6101@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>m.islam6101@gmail.com</span>
            </a>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <a
              href="tel:+8801959186101"
              className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>+880 1959-186101</span>
            </a>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <a
              href="https://www.linkedin.com/in/md-mahmudul-islam-a8bb41306/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Bottom row: Privacy guarantee & copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Client-Side • All processing performed locally in your browser</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <span>© {new Date().getFullYear()} PhotoKit • Developed by Md. Mahmudul Islam. Free browser utility.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
