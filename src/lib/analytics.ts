/**
 * PhotoKit Privacy-Preserving Analytics Dispatcher
 *
 * Strictly adheres to data minimization:
 * - NO image content, pixel data, or canvas buffers.
 * - NO original or output filenames.
 * - NO file MIME types or formats derived from user files.
 * - NO file sizes, dimensions, aspect ratios, or EXIF metadata.
 * - NO compression ratios, savings percentages, or execution durations.
 * - NO blob URLs, file paths, or storage references.
 * - NO query strings, URL parameters, or URL fragments.
 * - NO user-entered values, freeform strings, or system error messages.
 */

export const GA_MEASUREMENT_ID = 'G-DH98V1E896';
export const CONSENT_STORAGE_KEY = 'photokit-consent';

export type ConsentState = 'granted' | 'denied' | null;

export type ToolName = 'compressor' | 'resizer' | 'converter' | 'homepage';

export type ActionType =
  | 'file_validation_success'
  | 'mode_switch'
  | 'preset_select'
  | 'aspect_lock_toggle'
  | 'process_start'
  | 'process_success'
  | 'file_download'
  | 'error';

export type PermittedMode =
  | 'target_kb'
  | 'quality'
  | 'dimensions'
  | 'transcode';

export type PermittedPreset =
  | 'preset_20kb'
  | 'preset_50kb'
  | 'preset_100kb'
  | 'preset_200kb'
  | 'preset_500kb'
  | 'preset_1mb'
  | 'preset_50_percent'
  | 'preset_75_percent'
  | 'preset_fhd'
  | 'preset_hd'
  | 'preset_web'
  | 'preset_square'
  | 'preset_avatar'
  | 'custom';

export type PermittedErrorCode =
  | 'target_unreachable'
  | 'canvas_encoding_failed'
  | 'canvas_encoding_timeout'
  | 'corrupted_file'
  | 'invalid_file_type'
  | 'dimensions_exceed_limit'
  | 'surface_area_exceed_limit'
  | 'load_failed'
  | 'unknown_error';

// Standard static route titles map (no dynamic user strings)
const STATIC_ROUTE_TITLES: Record<string, string> = {
  '/': 'PhotoKit — Browser-Native Image Compressor, Resizer & Converter',
  '/compressor/': 'Image Compressor — PhotoKit',
  '/resizer/': 'Image Resizer — PhotoKit',
  '/converter/': 'Image Converter — PhotoKit',
  '/about/': 'About Us | PhotoKit',
  '/contact/': 'Contact Us | PhotoKit',
  '/terms/': 'Terms of Use | PhotoKit',
  '/privacy-policy/': 'Privacy Policy — PhotoKit',
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fail-closed localStorage reader.
 * Returns null if localStorage throws (SecurityError/disabled storage),
 * keeping analytics strictly disabled.
 */
export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'granted' || val === 'denied') return val;
    return null;
  } catch {
    // Fail closed: storage unavailable or blocked
    return null;
  }
}

/**
 * Updates consent state in localStorage, notifies listeners,
 * and handles dispatcher/cookie lifecycle.
 */
export function setConsentState(state: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // If storage is blocked, cannot persist
  }

  if (state === 'denied') {
    // Immediate dispatcher invalidation and cookie purge
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      } catch {}
    }
    purgeAnalyticsCookies();
    // Overwrite gtag to a silent no-op
    window.gtag = () => {};
  }

  // Notify components across current window
  window.dispatchEvent(new CustomEvent('photokit-consent-changed', { detail: state }));
}

/**
 * Checks whether analytics consent is currently granted.
 */
export function isConsentGranted(): boolean {
  return getConsentState() === 'granted';
}

/**
 * Sanitizes page location to origin + clean pathname.
 * Explicitly strips query parameters and URL fragments.
 */
export function getSanitizedLocation(pathname: string): string {
  const cleanPath = pathname.split('?')[0].split('#')[0];
  const normalized = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  const route = normalized === '//' ? '/' : normalized;
  return `https://photokit-app.pages.dev${route}`;
}

/**
 * Purges client-accessible GA4 cookies (_ga, _ga_*).
 * Note: Cannot delete HttpOnly cookies or cookies outside current domain scope.
 */
export function purgeAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  try {
    const cookies = document.cookie.split(';');
    const hostname = window.location.hostname;
    for (const cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.cookie = `${name}=; Path=/; Domain=.${hostname}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }
    }
  } catch {}
}

/**
 * Low-level event dispatcher that verifies consent immediately before sending.
 */
function dispatchGtag(command: string, ...args: unknown[]): void {
  if (!isConsentGranted()) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    window.gtag(command, ...args);
  } catch {}
}

/**
 * Dispatches a standard sanitized page_view.
 */
export function trackPageView(pathname: string): void {
  if (!isConsentGranted()) return;

  const sanitizedLocation = getSanitizedLocation(pathname);
  const cleanPath = pathname.split('?')[0].split('#')[0];
  const normalizedPath = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  const route = normalizedPath === '//' ? '/' : normalizedPath;
  const pageTitle = STATIC_ROUTE_TITLES[route] || 'PhotoKit';

  dispatchGtag('event', 'page_view', {
    page_location: sanitizedLocation,
    page_path: route,
    page_title: pageTitle,
  });
}

/**
 * Dispatches file_selected event with strictly permitted parameters.
 */
export function trackFileSelected(toolName: ToolName): void {
  dispatchGtag('event', 'file_selected', {
    tool_name: toolName,
    action_type: 'file_validation_success',
  });
}

/**
 * Dispatches tool_mode_selected event with strictly permitted parameters.
 */
export function trackToolModeSelected(params: {
  toolName: ToolName;
  actionType: 'mode_switch' | 'preset_select' | 'aspect_lock_toggle';
  mode?: PermittedMode;
  preset?: PermittedPreset;
}): void {
  const payload: Record<string, string> = {
    tool_name: params.toolName,
    action_type: params.actionType,
  };
  if (params.mode) payload.mode = params.mode;
  if (params.preset) payload.preset = params.preset;

  dispatchGtag('event', 'tool_mode_selected', payload);
}

/**
 * Dispatches tool_started event with strictly permitted parameters.
 */
export function trackToolStarted(params: {
  toolName: ToolName;
  mode: PermittedMode;
  preset?: PermittedPreset;
}): void {
  const payload: Record<string, string> = {
    tool_name: params.toolName,
    action_type: 'process_start',
    mode: params.mode,
  };
  if (params.preset) payload.preset = params.preset;

  dispatchGtag('event', 'tool_started', payload);
}

/**
 * Dispatches processing_completed event with strictly permitted parameters.
 */
export function trackProcessingCompleted(params: {
  toolName: ToolName;
  mode: PermittedMode;
}): void {
  dispatchGtag('event', 'processing_completed', {
    tool_name: params.toolName,
    action_type: 'process_success',
    mode: params.mode,
  });
}

/**
 * Dispatches download_clicked event with strictly permitted parameters.
 */
export function trackDownloadClicked(toolName: ToolName): void {
  dispatchGtag('event', 'download_clicked', {
    tool_name: toolName,
    action_type: 'file_download',
  });
}

/**
 * Dispatches processing_error event with predefined sanitized error code only.
 */
export function trackProcessingError(toolName: ToolName, errorCode: PermittedErrorCode): void {
  dispatchGtag('event', 'processing_error', {
    tool_name: toolName,
    action_type: 'error',
    error_code: errorCode,
  });
}
