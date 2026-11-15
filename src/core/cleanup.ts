/**
 * PixelKit Core Image Processing Engine - Resource Cleanup
 */

/**
 * Revokes a single Blob Object URL safely.
 */
export function revokeObjectUrl(url: string | null | undefined): void {
  if (!url || typeof url !== 'string') return;
  if (url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {
      // Ignore errors during revocation
    }
  }
}

/**
 * Revokes an array of Blob Object URLs.
 */
export function revokeObjectUrls(urls: (string | null | undefined)[]): void {
  for (const url of urls) {
    revokeObjectUrl(url);
  }
}
