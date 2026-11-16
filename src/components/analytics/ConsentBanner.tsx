'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getConsentState,
  setConsentState,
  CONSENT_STORAGE_KEY,
  ConsentState,
} from '@/lib/analytics';
import { Shield, Cookie, X } from 'lucide-react';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user has not yet decided (null)
    const current = getConsentState();
    if (current === null) {
      setVisible(true);
    }

    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentState>;
      if (customEvent.detail !== null) {
        setVisible(false);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY && e.newValue !== null) {
        setVisible(false);
      }
    };

    window.addEventListener('photokit-consent-changed', handleConsentChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('photokit-consent-changed', handleConsentChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setConsentState('granted');
    setVisible(false);
  };

  const handleDecline = () => {
    setConsentState('denied');
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Analytics Consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Privacy & Analytics Preferences
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Shield className="w-3 h-3" />
                <span>100% Local Processing</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              PhotoKit uses optional Google Analytics to understand aggregate tool usage and improve performance. We do not send your images, filenames, or file metadata to Google. Google Analytics may collect technical device and network information. All image operations execute 100% in your local browser memory.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDecline}
                className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 sm:flex-none rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Accept Analytics
              </button>

              <Link
                href="/privacy-policy"
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 ml-auto"
              >
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
