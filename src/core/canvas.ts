/**
 * PixelKit Core Image Processing Engine - Canvas Operations
 */

import { CANVAS_ENCODING_TIMEOUT_MS, DEFAULT_JPEG_BACKGROUND_COLOR } from './constants';
import { ProcessingError, SupportedMimeType } from './types';

/**
 * Creates an in-memory HTMLCanvasElement with high-quality 2D context.
 */
export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) {
    throw new ProcessingError(
      'CANVAS_CONTEXT_UNAVAILABLE',
      'Unable to acquire 2D rendering context from HTMLCanvasElement.'
    );
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return { canvas, ctx };
}

/**
 * Extracts numeric width and height safely from any CanvasImageSource.
 */
export function getImageDimensions(source: CanvasImageSource): { width: number; height: number } {
  if ('naturalWidth' in source && typeof source.naturalWidth === 'number' && source.naturalWidth > 0) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  if ('width' in source) {
    const w = typeof source.width === 'number' ? source.width : (source.width as SVGAnimatedLength).baseVal.value;
    const h = typeof source.height === 'number' ? source.height : (source.height as SVGAnimatedLength).baseVal.value;
    return { width: w, height: h };
  }
  return { width: 0, height: 0 };
}

/**
 * Draws an image element onto a canvas, optionally applying a solid background color
 * for transparent pixel flattening (essential for JPEG conversion).
 */
export function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  targetWidth: number,
  targetHeight: number,
  backgroundColor?: string
): void {
  // If target format requires flattening transparency (e.g. JPEG), fill background first
  if (backgroundColor) {
    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.restore();
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
}

/**
 * Internal single-attempt toBlob execution with timeout and late callback protection.
 */
function attemptToBlob(
  canvas: HTMLCanvasElement,
  mimeType: SupportedMimeType,
  quality?: number
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      isCancelled = true;
      reject(
        new ProcessingError(
          'CANVAS_ENCODING_TIMEOUT',
          `Canvas encoding timed out after ${CANVAS_ENCODING_TIMEOUT_MS}ms.`
        )
      );
    }, CANVAS_ENCODING_TIMEOUT_MS);

    try {
      canvas.toBlob(
        (blob) => {
          clearTimeout(timer);
          if (isCancelled) {
            // Late callback arrived after timeout had already rejected; safely ignore
            return;
          }

          if (!blob) {
            reject(
              new ProcessingError(
                'CANVAS_ENCODING_FAILED',
                'Browser canvas encoder returned null Blob (possible memory exhaustion).'
              )
            );
            return;
          }

          resolve(blob);
        },
        mimeType,
        quality
      );
    } catch (err) {
      clearTimeout(timer);
      if (!isCancelled) {
        reject(
          new ProcessingError(
            'CANVAS_ENCODING_FAILED',
            `Canvas toBlob threw an exception: ${err instanceof Error ? err.message : String(err)}`
          )
        );
      }
    }
  });
}

/**
 * Encodes a canvas to a Blob with timeout handling, late-callback ignoring,
 * and exactly ONE controlled retry before reporting CANVAS_ENCODING_FAILED.
 */
export async function safeEncodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: SupportedMimeType,
  quality?: number
): Promise<Blob> {
  try {
    return await attemptToBlob(canvas, mimeType, quality);
  } catch (firstError) {
    // If the first attempt timed out, immediately rethrow without retrying
    if (firstError instanceof ProcessingError && firstError.code === 'CANVAS_ENCODING_TIMEOUT') {
      throw firstError;
    }

    // Only retry on encoding failures (null Blob or synchronous exception)
    // Perform exactly ONE controlled retry after a 50ms stabilization delay
    try {
      await new Promise((r) => setTimeout(r, 50));
      return await attemptToBlob(canvas, mimeType, quality);
    } catch (retryError) {
      // If the retry attempt timed out, preserve the timeout error code
      if (retryError instanceof ProcessingError && retryError.code === 'CANVAS_ENCODING_TIMEOUT') {
        throw retryError;
      }

      // Persistent encoding failure
      throw new ProcessingError(
        'CANVAS_ENCODING_FAILED',
        `Canvas encoding failed after retry: ${
          retryError instanceof Error ? retryError.message : String(retryError)
        }`,
        {
          initialError: firstError instanceof Error ? firstError.message : String(firstError),
          retryError: retryError instanceof Error ? retryError.message : String(retryError),
        }
      );
    }
  }
}

/**
 * Releases canvas backing surfaces and clears dimensions to help garbage collection.
 */
export function disposeCanvas(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
  } catch (_) {
    // Ignore cleanup errors on disposal
  }
}
