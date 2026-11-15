/**
 * PixelKit Core Image Processing Engine - Constants & Boundaries
 */

import { SupportedMimeType } from './types';

/** Maximum permitted single dimension (width or height) in pixels */
export const MAX_SAFE_DIMENSION = 8192;

/** Maximum permitted total surface area (width * height) in pixels (~16.7 Megapixels, e.g. 4096 x 4096) */
export const MAX_SAFE_PIXEL_AREA = 16_777_216;

/** Mobile memory warning threshold: dimensions exceeding this trigger a performance advisory */
export const MOBILE_WARNING_DIMENSION = 4096;

/** Canvas encoding timeout in milliseconds */
export const CANVAS_ENCODING_TIMEOUT_MS = 6000;

/** Default background color used to flatten transparency when encoding to JPEG */
export const DEFAULT_JPEG_BACKGROUND_COLOR = '#FFFFFF';

/** Standard target size presets in bytes */
export const TARGET_SIZE_PRESETS = {
  PRESET_20KB: 20 * 1024,
  PRESET_50KB: 50 * 1024,
  PRESET_100KB: 100 * 1024,
  PRESET_200KB: 200 * 1024,
} as const;

/** Minimum and maximum quality bounds for lossy compression */
export const MIN_QUALITY = 0.01;
export const MAX_QUALITY = 1.00;

/** Default number of binary search iterations */
export const DEFAULT_BINARY_SEARCH_ITERATIONS = 7;

/** Recognized MIME types */
export const SUPPORTED_MIME_TYPES: readonly SupportedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** Magic byte signatures for client-side MIME verification */
export const MAGIC_BYTE_SIGNATURES = {
  JPEG: [0xff, 0xd8, 0xff],
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46], // 'RIFF'
  WEBP_HEADER: [0x57, 0x45, 0x42, 0x50], // 'WEBP'
} as const;
