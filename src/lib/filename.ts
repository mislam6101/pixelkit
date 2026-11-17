/**
 * PhotoKit Centralized Download Filename Generation Utility
 *
 * Guarantees consistent, professional, and cross-platform safe download filenames
 * across all client-side image processing tools (Compressor, Resizer, Converter).
 */

export interface GenerateDownloadFilenameOptions {
  /** Original filename of the input file (e.g. 'photo.jpg') */
  originalName?: string | null;
  /** Identifier of the processing tool */
  toolName?: 'compressor' | 'resizer' | 'converter' | 'homepage' | string | null;
  /** Target MIME type of the processed image result (e.g. 'image/jpeg') */
  outputMimeType: string;
  /** Optional custom filename requested by caller (treated as unknown for runtime safety) */
  customFilename?: unknown;
}

const GENERIC_BASENAMES = new Set([
  'blob',
  'undefined',
  'null',
  '[object object]',
  '[object mouseevent]',
  'image',
  '',
]);

/**
 * Pure function to generate a sanitized, operation-specific download filename.
 * Prevents accidental object stringification (such as '[object Object]' from React click events).
 */
export function generateDownloadFilename({
  originalName,
  toolName,
  outputMimeType,
  customFilename,
}: GenerateDownloadFilenameOptions): string {
  // 1. Determine appropriate output extension based on target MIME type
  const isJpeg = outputMimeType === 'image/jpeg';
  const isWebp = outputMimeType === 'image/webp';
  const isPng = outputMimeType === 'image/png';

  const origExt =
    typeof originalName === 'string' && originalName.includes('.')
      ? originalName.split('.').pop()?.toLowerCase() || ''
      : '';

  let ext = 'png';
  if (isJpeg) {
    // Preserve .jpeg spelling if the input was explicitly .jpeg
    ext = origExt === 'jpeg' ? 'jpeg' : 'jpg';
  } else if (isWebp) {
    ext = 'webp';
  } else if (isPng) {
    ext = 'png';
  } else {
    ext = outputMimeType.replace(/^image\//, '').toLowerCase() || 'png';
  }

  // 2. Validate and handle customFilename (strictly accepting non-empty strings)
  if (typeof customFilename === 'string') {
    const trimmed = customFilename.trim();
    if (trimmed.length > 0 && !GENERIC_BASENAMES.has(trimmed.toLowerCase())) {
      // Strip directory paths and filesystem-invalid characters
      let cleanCustom = trimmed
        .replace(/^.*[\\/]/, '')
        .replace(/[/\\?%*:|"<>]/g, '')
        .replace(/[\x00-\x1f\x7f]/g, '')
        .trim();

      if (cleanCustom.length > 0 && !GENERIC_BASENAMES.has(cleanCustom.toLowerCase())) {
        // Avoid duplicate extension if it already ends with .<ext>
        if (cleanCustom.toLowerCase().endsWith(`.${ext}`)) {
          return cleanCustom;
        }

        // If it ends with another image extension (e.g. .png when saving as .jpg), strip it
        const hasOtherExt = /\.(jpe?g|png|webp|gif|bmp|svg|tiff)$/i.test(cleanCustom);
        if (hasOtherExt) {
          cleanCustom = cleanCustom.substring(0, cleanCustom.lastIndexOf('.'));
        }

        if (cleanCustom.endsWith('.')) {
          cleanCustom = cleanCustom.slice(0, -1);
        }

        return `${cleanCustom}.${ext}`;
      }
    }
  }

  // 3. Extract, sanitize, and normalize original base name
  let base = 'image';
  if (typeof originalName === 'string') {
    // Strip leading directory paths (handles both POSIX and Windows separators)
    const strippedPath = originalName.replace(/^.*[\\/]/, '').trim();
    const lastDot = strippedPath.lastIndexOf('.');
    let rawBase = strippedPath;

    if (lastDot > 0) {
      // Retain internal dots (e.g. 'vacation.photo' from 'vacation.photo.jpeg')
      rawBase = strippedPath.substring(0, lastDot);
    } else if (lastDot === 0 && strippedPath.length > 1) {
      // Leading dot without extension (e.g. '.hidden')
      rawBase = strippedPath;
    }

    // Sanitize illegal filesystem characters while strictly preserving Unicode, spaces, and ()
    const sanitized = rawBase
      .replace(/[/\\?%*:|"<>]/g, '')
      .replace(/[\x00-\x1f\x7f]/g, '')
      .trim();

    if (sanitized.length > 0 && !GENERIC_BASENAMES.has(sanitized.toLowerCase())) {
      base = sanitized;
    }
  }

  // 4. Determine operation-specific suffix
  let suffix = '-optimized';
  if (toolName === 'compressor') {
    suffix = '-compressed';
  } else if (toolName === 'resizer') {
    suffix = '-resized';
  } else if (toolName === 'converter') {
    suffix = '-converted';
  }

  return `${base}${suffix}.${ext}`;
}
