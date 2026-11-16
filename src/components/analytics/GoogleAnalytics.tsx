'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  GA_MEASUREMENT_ID,
  CONSENT_STORAGE_KEY,
  getConsentState,
  isConsentGranted,
  trackPageView,
  purgeAnalyticsCookies,
  ConsentState,
} from '@/lib/analytics';

const SCRIPT_ID = 'ga4-core-script';

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const lastTrackedPathRef = useRef<string | null>(null);

  // Initialize consent state and listen to local + cross-tab changes
  useEffect(() => {
    const syncConsent = () => {
      const granted = isConsentGranted();
      setHasConsent(granted);
    };

    // Check initial state (fail-closed)
    syncConsent();

    // Listen to in-window consent events
    const handleLocalConsent = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentState>;
      setHasConsent(customEvent.detail === 'granted');
    };

    // Listen to cross-tab storage events
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) {
        setHasConsent(e.newValue === 'granted');
      }
    };

    window.addEventListener('photokit-consent-changed', handleLocalConsent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('photokit-consent-changed', handleLocalConsent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Manage Google Analytics Script lifecycle based strictly on consent
  useEffect(() => {
    if (!hasConsent) {
      // Consent is NOT granted or was revoked:
      // Remove any existing script tag from DOM
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
      lastTrackedPathRef.current = null;
      return;
    }

    // Consent IS granted:
    // Initialize dataLayer and gtag prior to loading script
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    // Explicitly declare consent granted before config
    gtag('consent', 'default', {
      analytics_storage: 'granted',
    });

    // Configure GA4: send_page_view false to avoid double tracking
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    // Inject script if not already present
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    // Initial page view dispatch for the current route
    if (pathname && lastTrackedPathRef.current !== pathname) {
      trackPageView(pathname);
      lastTrackedPathRef.current = pathname;
    }
  }, [hasConsent]);

  // Handle SPA route transitions (deduplicated)
  useEffect(() => {
    if (!hasConsent || !pathname) return;

    if (lastTrackedPathRef.current !== pathname) {
      trackPageView(pathname);
      lastTrackedPathRef.current = pathname;
    }
  }, [pathname, hasConsent]);

  return null;
}
