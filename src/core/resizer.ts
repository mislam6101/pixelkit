/**
 * PixelKit Core Image Processing Engine - Resizing Module
 */

import { DEFAULT_JPEG_BACKGROUND_COLOR, MAX_QUALITY } from './constants';
import { createCanvas, disposeCanvas, drawImageToCanvas, getImageDimensions, safeEncodeCanvas } from './canvas';
import { ProcessedImageResult, ProcessingError, ResizeOptions, SupportedMimeType } from './types';
import { validateDimensions } from './validation';

/**
 * Calculates target dimensions preserving aspect ratio or freeform.
 */
export function calculateTargetDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth?: number,
  targetHeight?: number,
  maintainAspectRatio = true
): { width: number; height: number } {
  if (!targetWidth && !targetHeight) {
    return { width: sourceWidth, height: sourceHeight };
  }

  const aspectRatio = sourceWidth / sourceHeight;

  if (maintainAspectRatio) {
    if (targetWidth && !targetHeight) {
      return {
        width: Math.round(targetWidth),
        height: Math.round(targetWidth / aspectRatio),
      };
    }

    if (!targetWidth && targetHeight) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: Math.round(targetHeight),
      };
    }

    if (targetWidth && targetHeight) {
      // Fit within bounding box while preserving original ratio
      const widthRatio = targetWidth / sourceWidth;
      const heightRatio = targetHeight / sourceHeight;
      const scale = Math.min(widthRatio, heightRatio);

      return {
        width: Math.round(sourceWidth * scale),
        height: Math.round(sourceHeight * scale),
      };
    }
  }

  // Freeform stretching
  return {
    width: Math.round(targetWidth || sourceWidth),
    height: Math.round(targetHeight || sourceHeight),
  };
}

/**
 * Resizes an image to specified dimensions.
 */
export async function resizeImage(
  image: CanvasImageSource,
  options: ResizeOptions
): Promise<ProcessedImageResult> {
  const { width: sourceWidth, height: sourceHeight } = getImageDimensions(image);

  const {
    targetWidth,
    targetHeight,
    maintainAspectRatio = true,
    mimeType = 'image/jpeg',
    backgroundColor = mimeType === 'image/jpeg' ? DEFAULT_JPEG_BACKGROUND_COLOR : undefined,
    quality = MAX_QUALITY,
  } = options;

  const { width: finalWidth, height: finalHeight } = calculateTargetDimensions(
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
    maintainAspectRatio
  );

  const dimCheck = validateDimensions(finalWidth, finalHeight);
  if (!dimCheck.valid) {
    throw new ProcessingError(
      dimCheck.error?.includes('area') ? 'PIXEL_AREA_EXCEEDED' : 'DIMENSION_EXCEEDED',
      dimCheck.error || 'Requested resize dimensions exceed safe hardware limits.'
    );
  }

  const { canvas, ctx } = createCanvas(finalWidth, finalHeight);
  try {
    drawImageToCanvas(canvas, ctx, image, finalWidth, finalHeight, backgroundColor);
    const blob = await safeEncodeCanvas(canvas, mimeType as SupportedMimeType, quality);

    return {
      blob,
      sizeBytes: blob.size,
      width: finalWidth,
      height: finalHeight,
      mimeType: mimeType as SupportedMimeType,
      appliedQuality: quality,
      objectUrl: URL.createObjectURL(blob),
    };
  } finally {
    disposeCanvas(canvas);
  }
}
