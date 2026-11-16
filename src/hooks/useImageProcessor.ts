'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ImageMetadata,
  ProcessedImageResult,
  ProcessingError,
} from '@/core/types';
import { inspectImage } from '@/core/validation';
import { revokeObjectUrl } from '@/core/cleanup';

export interface UseImageProcessorReturn {
  file: File | null;
  metadata: ImageMetadata | null;
  imageElement: HTMLImageElement | null;
  previewUrl: string | null;
  result: ProcessedImageResult | null;
  isProcessing: boolean;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
  warning: string | null;
  loadFile: (file: File) => Promise<boolean>;
  setResult: (result: ProcessedImageResult) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: { code: string; message: string; details?: Record<string, unknown> } | null) => void;
  clearError: () => void;
  clear: () => void;
  downloadResult: (customFilename?: string) => void;
}

export function useImageProcessor(): UseImageProcessorReturn {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResultState] = useState<ProcessedImageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Keep ref of active object URLs for guaranteed unmount cleanup
  const activeUrlsRef = useRef<{ previewUrl: string | null; resultUrl: string | null }>({
    previewUrl: null,
    resultUrl: null,
  });

  const clear = useCallback(() => {
    if (activeUrlsRef.current.previewUrl) {
      revokeObjectUrl(activeUrlsRef.current.previewUrl);
      activeUrlsRef.current.previewUrl = null;
    }
    if (activeUrlsRef.current.resultUrl) {
      revokeObjectUrl(activeUrlsRef.current.resultUrl);
      activeUrlsRef.current.resultUrl = null;
    }

    setFile(null);
    setMetadata(null);
    setImageElement(null);
    setPreviewUrl(null);
    setResultState(null);
    setError(null);
    setWarning(null);
    setIsProcessing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeUrlsRef.current.previewUrl) {
        revokeObjectUrl(activeUrlsRef.current.previewUrl);
      }
      if (activeUrlsRef.current.resultUrl) {
        revokeObjectUrl(activeUrlsRef.current.resultUrl);
      }
    };
  }, []);

  const setResult = useCallback((newResult: ProcessedImageResult) => {
    if (activeUrlsRef.current.resultUrl && activeUrlsRef.current.resultUrl !== newResult.objectUrl) {
      revokeObjectUrl(activeUrlsRef.current.resultUrl);
    }
    activeUrlsRef.current.resultUrl = newResult.objectUrl;
    setResultState(newResult);
  }, []);

  const loadFile = useCallback(
    async (newFile: File): Promise<boolean> => {
      clear();
      setIsProcessing(true);
      setError(null);
      setWarning(null);

      try {
        const { imageElement: loadedImg, metadata: meta } = await inspectImage(newFile);

        const newPreviewUrl = URL.createObjectURL(newFile);
        activeUrlsRef.current.previewUrl = newPreviewUrl;

        setFile(newFile);
        setMetadata(meta);
        setImageElement(loadedImg);
        setPreviewUrl(newPreviewUrl);

        if (meta.requiresMemoryWarning) {
          setWarning(
            `High-resolution image (${meta.width}×${meta.height}px). Processing large images in browser memory may take a moment.`
          );
        }

        return true;
      } catch (err: unknown) {
        if (err instanceof ProcessingError) {
          setError({
            code: err.code,
            message: err.message,
            details: err.details,
          });
        } else if (err instanceof Error) {
          setError({
            code: 'LOAD_FAILED',
            message: err.message || 'Failed to load and inspect image.',
          });
        } else {
          setError({
            code: 'UNKNOWN_ERROR',
            message: 'An unexpected error occurred while loading the image.',
          });
        }
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [clear]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const downloadResult = useCallback(
    (customFilename?: string) => {
      if (!result || !file) return;

      let filename = customFilename;
      if (!filename) {
        const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const ext = result.mimeType === 'image/jpeg' ? 'jpg' : result.mimeType === 'image/webp' ? 'webp' : 'png';
        filename = `${originalBase}-photokit.${ext}`;
      }

      const link = document.createElement('a');
      link.href = result.objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [result, file]
  );

  return {
    file,
    metadata,
    imageElement,
    previewUrl,
    result,
    isProcessing,
    error,
    warning,
    loadFile,
    setResult,
    setIsProcessing,
    setError,
    clearError,
    clear,
    downloadResult,
  };
}
