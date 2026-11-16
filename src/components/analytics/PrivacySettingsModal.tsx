'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getConsentState,
  setConsentState,
  CONSENT_STORAGE_KEY,
  ConsentState,
} from '@/lib/analytics';
import { Shield, ShieldAlert, ShieldCheck, X, AlertTriangle } from 'lucide-react';

export function PrivacySettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<ConsentState>(null);

  useEffect(() => {
    setCurrentConsent(getConsentState());

    const handleOpen = () => {
      setCurrentConsent(getConsentState());
      setIsOpen(true);
    };

    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentState>;
      setCurrentConsent(customEvent.detail);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) {
        setCurrentConsent(e.newValue as ConsentState);
      }
    };

    window.addEventListener('photokit-open-privacy-settings', handleOpen);
    window.addEventListener('photokit-consent-changed', handleConsentChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('photokit-open-privacy-settings', handleOpen);
      window.removeEventListener('photokit-consent-changed', handleConsentChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGrant = () => {
    setConsentState('granted');
  };

  const handleRevoke = () => {
    setConsentState('denied');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 id="privacy-settings-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Privacy & Analytics Preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close privacy settings"
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Badge */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 flex items-start gap-3">
          {currentConsent === 'granted' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Current Status:{' '}
              {currentConsent === 'granted' ? (
                <span className="text-emerald-600 dark:text-emerald-400">Analytics Enabled</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Analytics Disabled</span>
              )}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentConsent === 'granted'
                ? 'Aggregate tool usage events are transmitted to Google Analytics without image content, filenames, or user personal data.'
                : 'No analytics events are collected. The Google Analytics script is disabled and will not execute.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {currentConsent === 'granted' ? (
            <button
              type="button"
              onClick={handleRevoke}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
            >
              Withdraw Analytics Consent
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGrant}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              Enable Analytics
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        {/* Accurate Notice & Limitations */}
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-[11px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Important Disclosure</span>
          </div>
          <p className="leading-relaxed">
            Withdrawing consent immediately stops all subsequent analytics events, removes accessible tracking cookies where technically possible, and disables the analytics dispatcher. Data previously transmitted to Google Analytics cannot be retroactively modified or deleted through this control.
          </p>
        </div>

        <div className="pt-1 text-center">
          <Link
            href="/privacy-policy"
            onClick={() => setIsOpen(false)}
            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Read our full Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Global helper to open the Privacy Settings modal from anywhere in the app.
 */
export function openPrivacySettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('photokit-open-privacy-settings'));
  }
}
