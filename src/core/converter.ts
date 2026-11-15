/**
 * PixelKit Core Image Processing Engine - Format Conversion
 */

import { DEFAULT_JPEG_BACKGROUND_COLOR, MAX_QUALITY } from './constants';
import { createCanvas, disposeCanvas, drawImageToCanvas, getImageDimensions, safeEncodeCanvas } from './canvas';
import { ConvertOptions, ProcessedImageResult, ProcessingError } from './types';

/**
 * Converts an image between JPEG, PNG, and WebP formats.
 *
 * Rules:
 * 1. Converting transparent source to JPEG flattens against `backgroundColor` (defaults to #FFFFFF).
 * 2. Converting to WebP or PNG preserves transparency.
 * 3. Quality parameter applies to lossy targets (JPEG and WebP).
 */
export async function convertImageFormat(
  image: CanvasImageSource,
  options: ConvertOptions
): Promise<ProcessedImageResult> {
  const {
    targetMimeType,
    quality = MAX_QUALITY,
    backgroundColor = targetMimeType === 'image/jpeg' ? DEFAULT_JPEG_BACKGROUND_COLOR : undefined,
  } = options;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(targetMimeType)) {
    throw new ProcessingError(
      'INVALID_FILE_TYPE',
      `Unsupported target conversion format: ${targetMimeType}. Supported formats: JPEG, PNG, WebP.`
    );
  }

  const { width, height } = getImageDimensions(image);

  const { canvas, ctx } = createCanvas(width, height);
  try {
    drawImageToCanvas(canvas, ctx, image, width, height, backgroundColor);

    // Standard canvas encoding; quality is ignored by browser if targetMimeType is image/png
    const blob = await safeEncodeCanvas(canvas, targetMimeType, quality);

    return {
      blob,
      sizeBytes: blob.size,
      width,
      height,
      mimeType: targetMimeType,
      appliedQuality: targetMimeType === 'image/png' ? undefined : quality,
      objectUrl: URL.createObjectURL(blob),
    };
  } finally {
    disposeCanvas(canvas);
  }
}
