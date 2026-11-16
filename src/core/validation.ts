/**
 * PixelKit Core Image Processing Engine - Validation & Inspection
 */

import {
  MAX_SAFE_DIMENSION,
  MAX_SAFE_PIXEL_AREA,
  MOBILE_WARNING_DIMENSION,
  MAGIC_BYTE_SIGNATURES,
  SUPPORTED_MIME_TYPES,
} from './constants';
import {
  DimensionValidationResult,
  ImageMetadata,
  ProcessingError,
  SupportedMimeType,
} from './types';

/**
 * Validates file magic bytes by reading the first 12 bytes of the file.
 * Protects against renamed or spoofed file extensions.
 */
export async function detectMimeTypeFromMagicBytes(file: File | Blob): Promise<SupportedMimeType> {
  const slice = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 4) {
    throw new ProcessingError('CORRUPTED_FILE', 'File is too small to contain valid image headers.');
  }

  // Check JPEG: FF D8 FF
  if (
    bytes[0] === MAGIC_BYTE_SIGNATURES.JPEG[0] &&
    bytes[1] === MAGIC_BYTE_SIGNATURES.JPEG[1] &&
    bytes[2] === MAGIC_BYTE_SIGNATURES.JPEG[2]
  ) {
    return 'image/jpeg';
  }

  // Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === MAGIC_BYTE_SIGNATURES.PNG[0] &&
    bytes[1] === MAGIC_BYTE_SIGNATURES.PNG[1] &&
    bytes[2] === MAGIC_BYTE_SIGNATURES.PNG[2] &&
    bytes[3] === MAGIC_BYTE_SIGNATURES.PNG[3] &&
    bytes[4] === MAGIC_BYTE_SIGNATURES.PNG[4] &&
    bytes[5] === MAGIC_BYTE_SIGNATURES.PNG[5] &&
    bytes[6] === MAGIC_BYTE_SIGNATURES.PNG[6] &&
    bytes[7] === MAGIC_BYTE_SIGNATURES.PNG[7]
  ) {
    return 'image/png';
  }

  // Check WebP: bytes 0-3 are 'RIFF' and bytes 8-11 are 'WEBP'
  if (
    bytes.length >= 12 &&
    bytes[0] === MAGIC_BYTE_SIGNATURES.WEBP_RIFF[0] &&
    bytes[1] === MAGIC_BYTE_SIGNATURES.WEBP_RIFF[1] &&
    bytes[2] === MAGIC_BYTE_SIGNATURES.WEBP_RIFF[2] &&
    bytes[3] === MAGIC_BYTE_SIGNATURES.WEBP_RIFF[3] &&
    bytes[8] === MAGIC_BYTE_SIGNATURES.WEBP_HEADER[0] &&
    bytes[9] === MAGIC_BYTE_SIGNATURES.WEBP_HEADER[1] &&
    bytes[10] === MAGIC_BYTE_SIGNATURES.WEBP_HEADER[2] &&
    bytes[11] === MAGIC_BYTE_SIGNATURES.WEBP_HEADER[3]
  ) {
    return 'image/webp';
  }

  // Fallback to file.type if valid and recognized
  const declaredType = file.type as SupportedMimeType;
  if (SUPPORTED_MIME_TYPES.includes(declaredType)) {
    return declaredType;
  }

  throw new ProcessingError(
    'INVALID_FILE_TYPE',
    `Unsupported or unverified image format. PhotoKit supports JPEG, PNG, and WebP files.`,
    { detectedBytes: Array.from(bytes.slice(0, 4)) }
  );
}

/**
 * Validates width, height, and total pixel area against browser memory safety ceilings.
 */
export function validateDimensions(width: number, height: number): DimensionValidationResult {
  if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
    return {
      valid: false,
      width,
      height,
      totalArea: 0,
      error: 'Invalid image dimensions. Width and height must be positive numbers.',
    };
  }

  const roundedWidth = Math.round(width);
  const roundedHeight = Math.round(height);
  const totalArea = roundedWidth * roundedHeight;

  if (roundedWidth > MAX_SAFE_DIMENSION || roundedHeight > MAX_SAFE_DIMENSION) {
    return {
      valid: false,
      width: roundedWidth,
      height: roundedHeight,
      totalArea,
      error: `Dimension exceeds hardware limit. Maximum allowable dimension is ${MAX_SAFE_DIMENSION}px.`,
    };
  }

  if (totalArea > MAX_SAFE_PIXEL_AREA) {
    return {
      valid: false,
      width: roundedWidth,
      height: roundedHeight,
      totalArea,
      error: `Total pixel area (${totalArea.toLocaleString()}px) exceeds the safe limit of ${MAX_SAFE_PIXEL_AREA.toLocaleString()}px.`,
    };
  }

  const needsWarning = roundedWidth > MOBILE_WARNING_DIMENSION || roundedHeight > MOBILE_WARNING_DIMENSION;
  const warning = needsWarning
    ? `High-resolution image (${roundedWidth}×${roundedHeight}). Processing may experience memory pressure on low-memory mobile devices.`
    : undefined;

  return {
    valid: true,
    width: roundedWidth,
    height: roundedHeight,
    totalArea,
    warning,
  };
}

/**
 * Decodes an image file and extracts full metadata including dimensions and aspect ratio.
 */
export async function inspectImage(file: File): Promise<{
  imageElement: HTMLImageElement;
  metadata: ImageMetadata;
}> {
  const mimeType = await detectMimeTypeFromMagicBytes(file);
  const objectUrl = URL.createObjectURL(file);

  try {
    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        reject(
          new ProcessingError(
            'CORRUPTED_FILE',
            'Failed to decode image data. The file may be corrupt or truncated.'
          )
        );
      };
      img.src = objectUrl;
    });

    const width = imageElement.naturalWidth;
    const height = imageElement.naturalHeight;
    const dimCheck = validateDimensions(width, height);

    if (!dimCheck.valid) {
      if (dimCheck.error?.includes('area')) {
        throw new ProcessingError('PIXEL_AREA_EXCEEDED', dimCheck.error, { width, height });
      }
      throw new ProcessingError('DIMENSION_EXCEEDED', dimCheck.error || 'Dimension limits exceeded.', {
        width,
        height,
      });
    }

    const metadata: ImageMetadata = {
      name: file.name,
      sizeBytes: file.size,
      width,
      height,
      aspectRatio: width / height,
      mimeType,
      hasAlphaChannel: mimeType === 'image/png' || mimeType === 'image/webp',
      requiresMemoryWarning: Boolean(dimCheck.warning),
    };

    return { imageElement, metadata };
  } finally {
    // Release object URL immediately after loading into the Image element
    URL.revokeObjectURL(objectUrl);
  }
}
