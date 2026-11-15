/**
 * PixelKit Core Image Processing Engine - Types & Contracts
 */

export type SupportedMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export type SupportedFormat = 'jpeg' | 'jpg' | 'png' | 'webp';

export interface ImageMetadata {
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  aspectRatio: number;
  mimeType: SupportedMimeType;
  hasAlphaChannel: boolean;
  requiresMemoryWarning: boolean; // True if width or height > 4096px
}

export type ProcessingErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'CORRUPTED_FILE'
  | 'DIMENSION_EXCEEDED'
  | 'PIXEL_AREA_EXCEEDED'
  | 'CANVAS_CONTEXT_UNAVAILABLE'
  | 'CANVAS_ENCODING_FAILED'
  | 'CANVAS_ENCODING_TIMEOUT'
  | 'TARGET_UNREACHABLE_AT_MIN_QUALITY'
  | 'PNG_QUALITY_NOT_SUPPORTED'
  | 'UNSUPPORTED_OPERATION';

export class ProcessingError extends Error {
  public readonly code: ProcessingErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: ProcessingErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ProcessingError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ProcessingError.prototype);
  }
}

export interface DimensionValidationResult {
  valid: boolean;
  width: number;
  height: number;
  totalArea: number;
  warning?: string;
  error?: string;
}

export interface TargetKbOptions {
  targetBytes: number;
  mimeType: 'image/jpeg' | 'image/webp';
  backgroundColor?: string; // Hex color for alpha flattening (e.g. #FFFFFF)
  maxIterations?: number; // Defaults to 7
  allowDownscale?: boolean; // Defaults to false; original dimensions preserved unless true
}

export interface CompressionCandidate {
  blob: Blob;
  quality: number;
  sizeBytes: number;
  iterationsUsed: number;
}

export interface QualityCompressionOptions {
  quality: number; // 0.01 to 1.00
  mimeType: SupportedMimeType;
  backgroundColor?: string;
}

export interface ResizeOptions {
  targetWidth?: number;
  targetHeight?: number;
  maintainAspectRatio: boolean;
  mimeType?: SupportedMimeType;
  backgroundColor?: string;
  quality?: number;
}

export interface ConvertOptions {
  targetMimeType: SupportedMimeType;
  quality?: number; // Used for JPEG/WebP (0.01 - 1.00)
  backgroundColor?: string; // Default #FFFFFF for JPEG conversion
}

export interface ProcessedImageResult {
  blob: Blob;
  sizeBytes: number;
  width: number;
  height: number;
  mimeType: SupportedMimeType;
  appliedQuality?: number;
  objectUrl: string;
}
