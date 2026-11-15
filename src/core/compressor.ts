/**
 * PixelKit Core Image Processing Engine - Compression & Target-KB Algorithm
 */

import {
  DEFAULT_BINARY_SEARCH_ITERATIONS,
  DEFAULT_JPEG_BACKGROUND_COLOR,
  MAX_QUALITY,
  MIN_QUALITY,
} from './constants';
import { createCanvas, disposeCanvas, drawImageToCanvas, getImageDimensions, safeEncodeCanvas } from './canvas';
import {
  CompressionCandidate,
  ProcessedImageResult,
  ProcessingError,
  QualityCompressionOptions,
  TargetKbOptions,
} from './types';

/**
 * Compresses an image to a strict target file size (in bytes) using a bounded bisection search.
 *
 * Guarantees:
 * 1. The returned output size will NEVER exceed `targetBytes`.
 * 2. Original dimensions are strictly preserved by default (no silent downscaling).
 * 3. Does not claim continuous mathematical global optimality; finds the highest valid quality
 *    factor within the discrete 7-iteration bisection search budget.
 */
export async function compressToTargetKb(
  image: CanvasImageSource,
  options: TargetKbOptions
): Promise<ProcessedImageResult> {
  const {
    targetBytes,
    mimeType,
    backgroundColor = mimeType === 'image/jpeg' ? DEFAULT_JPEG_BACKGROUND_COLOR : undefined,
    maxIterations = DEFAULT_BINARY_SEARCH_ITERATIONS,
    allowDownscale = false,
  } = options;

  if (mimeType === ('image/png' as string)) {
    throw new ProcessingError(
      'PNG_QUALITY_NOT_SUPPORTED',
      'The HTML5 Canvas API does not support lossy compression for PNG. Convert to WebP or JPEG to achieve target file sizes.'
    );
  }

  if (targetBytes <= 0 || !Number.isFinite(targetBytes)) {
    throw new ProcessingError(
      'UNSUPPORTED_OPERATION',
      'Target file size must be a positive number of bytes.'
    );
  }

  const { width, height } = getImageDimensions(image);

  const { canvas, ctx } = createCanvas(width, height);

  try {
    drawImageToCanvas(canvas, ctx, image, width, height, backgroundColor);

    // =========================================================================
    // STEP 1: Pre-flight Maximum Quality Probe (Q = 1.00)
    // =========================================================================
    const maxQualityBlob = await safeEncodeCanvas(canvas, mimeType, MAX_QUALITY);

    // If highest browser encoder setting satisfies the target, return immediately
    if (maxQualityBlob.size <= targetBytes) {
      return {
        blob: maxQualityBlob,
        sizeBytes: maxQualityBlob.size,
        width,
        height,
        mimeType,
        appliedQuality: MAX_QUALITY,
        objectUrl: URL.createObjectURL(maxQualityBlob),
      };
    }

    // =========================================================================
    // STEP 2: Pre-flight Minimum Quality Probe (Q = 0.01)
    // =========================================================================
    const minQualityBlob = await safeEncodeCanvas(canvas, mimeType, MIN_QUALITY);

    // If even minimum quality cannot meet the target, dimensions must be changed with user consent
    if (minQualityBlob.size > targetBytes) {
      if (!allowDownscale) {
        throw new ProcessingError(
          'TARGET_UNREACHABLE_AT_MIN_QUALITY',
          `Cannot reach target size (${Math.round(targetBytes / 1024)} KB) at original dimensions (${width}×${height}). Minimum achievable size is ${Math.round(minQualityBlob.size / 1024)} KB.`,
          {
            minAchievedBytes: minQualityBlob.size,
            targetBytes,
            originalWidth: width,
            originalHeight: height,
          }
        );
      }

      // If user explicitly permitted downscaling:
      return await compressWithIterativeDownscale(image, options);
    }

    // Seed baseline candidate from verified Q = 0.01 probe
    let bestCandidate: CompressionCandidate = {
      blob: minQualityBlob,
      quality: MIN_QUALITY,
      sizeBytes: minQualityBlob.size,
      iterationsUsed: 0,
    };

    // =========================================================================
    // STEP 3: Bounded Discrete Binary Search (7 Iterations)
    // =========================================================================
    let qLow = MIN_QUALITY;
    let qHigh = MAX_QUALITY;

    for (let iter = 1; iter <= maxIterations; iter++) {
      const qMid = Number(((qLow + qHigh) / 2).toFixed(4));

      let stepBlob: Blob;
      try {
        stepBlob = await safeEncodeCanvas(canvas, mimeType, qMid);
      } catch (err) {
        // If encoding fails even after safeEncodeCanvas internal retry, do not treat as oversized
        throw new ProcessingError(
          'CANVAS_ENCODING_FAILED',
          `Canvas encoding failed during iteration ${iter} at quality ${qMid}: ${
            err instanceof Error ? err.message : String(err)
          }`,
          { iteration: iter, quality: qMid }
        );
      }

      // Distinguish strictly oversized valid Blobs from candidates
      if (stepBlob.size <= targetBytes) {
        // Candidate meets hard ceiling; update best candidate
        bestCandidate = {
          blob: stepBlob,
          quality: qMid,
          sizeBytes: stepBlob.size,
          iterationsUsed: iter,
        };
        // Explore higher quality range to get closer to the target ceiling
        qLow = qMid;
      } else {
        // Exceeded targetBytes: disallowed; restrict search window downwards
        qHigh = qMid;
      }
    }

    // Return the highest valid quality discovered strictly <= targetBytes
    return {
      blob: bestCandidate.blob,
      sizeBytes: bestCandidate.sizeBytes,
      width,
      height,
      mimeType,
      appliedQuality: bestCandidate.quality,
      objectUrl: URL.createObjectURL(bestCandidate.blob),
    };
  } finally {
    disposeCanvas(canvas);
  }
}

/**
 * Controlled iterative downscale fallback when the user has EXPLICITLY authorized downscaling.
 * Scales down by 15% per pass until the target size is reached or minimum dimension floor is met.
 */
async function compressWithIterativeDownscale(
  image: CanvasImageSource,
  options: TargetKbOptions
): Promise<ProcessedImageResult> {
  const { targetBytes, mimeType, backgroundColor } = options;
  const { width: initialWidth, height: initialHeight } = getImageDimensions(image);

  let currentWidth = initialWidth;
  let currentHeight = initialHeight;

  // Maximum 5 downscale passes (down to approx 44% of original linear dimensions)
  for (let pass = 1; pass <= 5; pass++) {
    currentWidth = Math.round(currentWidth * 0.85);
    currentHeight = Math.round(currentHeight * 0.85);

    if (currentWidth < 100 || currentHeight < 100) {
      break;
    }

    const { canvas, ctx } = createCanvas(currentWidth, currentHeight);
    try {
      drawImageToCanvas(canvas, ctx, image, currentWidth, currentHeight, backgroundColor);
      const testBlob = await safeEncodeCanvas(canvas, mimeType, MIN_QUALITY);

      if (testBlob.size <= targetBytes) {
        // Now that the floor fits, run standard targetKb on these new dimensions without further downscaling
        const passResult = await compressToTargetKb(canvas, {
          ...options,
          allowDownscale: false,
        });

        return passResult;
      }
    } finally {
      disposeCanvas(canvas);
    }
  }

  throw new ProcessingError(
    'TARGET_UNREACHABLE_AT_MIN_QUALITY',
    `Unable to reach target size (${Math.round(targetBytes / 1024)} KB) even after downscaling to ${currentWidth}×${currentHeight}.`
  );
}

/**
 * Standard quality percentage compression (e.g. 75% quality).
 */
export async function compressWithQuality(
  image: CanvasImageSource,
  options: QualityCompressionOptions
): Promise<ProcessedImageResult> {
  const { quality, mimeType, backgroundColor } = options;

  if (quality < MIN_QUALITY || quality > MAX_QUALITY) {
    throw new ProcessingError(
      'UNSUPPORTED_OPERATION',
      `Quality must be between ${MIN_QUALITY} and ${MAX_QUALITY}. Provided: ${quality}`
    );
  }

  const { width, height } = getImageDimensions(image);

  const { canvas, ctx } = createCanvas(width, height);
  try {
    drawImageToCanvas(canvas, ctx, image, width, height, backgroundColor);
    const blob = await safeEncodeCanvas(canvas, mimeType, quality);

    return {
      blob,
      sizeBytes: blob.size,
      width,
      height,
      mimeType,
      appliedQuality: quality,
      objectUrl: URL.createObjectURL(blob),
    };
  } finally {
    disposeCanvas(canvas);
  }
}
