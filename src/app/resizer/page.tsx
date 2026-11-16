'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DropZone } from '@/components/ui/DropZone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { ImageComparison } from '@/components/features/ImageComparison';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { resizeImage, calculateTargetDimensions } from '@/core/resizer';
import { validateDimensions } from '@/core/validation';
import { ProcessingError, SupportedMimeType } from '@/core/types';
import { formatBytes } from '@/lib/utils';
import { useStagedImage } from '@/context/StagedImageContext';
import {
  trackToolModeSelected,
  trackToolStarted,
  trackProcessingCompleted,
  trackProcessingError,
  PermittedPreset,
  PermittedErrorCode,
} from '@/lib/analytics';
import {
  Maximize2,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';

const RESOLUTION_PRESETS = [
  { label: '50%', scale: 0.5 },
  { label: '75%', scale: 0.75 },
  { label: 'FHD (1920×1080)', width: 1920, height: 1080 },
  { label: 'HD (1280×720)', width: 1280, height: 720 },
  { label: 'Web (1200×630)', width: 1200, height: 630 },
  { label: 'Square (1080×1080)', width: 1080, height: 1080 },
  { label: 'Avatar (400×400)', width: 400, height: 400 },
];

export default function ResizerPage() {
  const {
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
  } = useImageProcessor('resizer');

  const { stagedFile, consumeStagedFile } = useStagedImage();
  const ingestedFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (!stagedFile || ingestedFileRef.current === stagedFile) return;

    let isMounted = true;

    const ingestStagedFile = async () => {
      const fileToLoad = stagedFile;
      const success = await loadFile(fileToLoad);
      if (isMounted && success) {
        ingestedFileRef.current = fileToLoad;
        consumeStagedFile();
      }
    };

    ingestStagedFile();

    return () => {
      isMounted = false;
    };
  }, [stagedFile, loadFile, consumeStagedFile]);

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatioLock, setAspectRatioLock] = useState<boolean>(true);
  const [targetFormat, setTargetFormat] = useState<'original' | 'image/jpeg' | 'image/png' | 'image/webp'>('original');
  const [quality, setQuality] = useState<number>(85);
  const [dimensionWarning, setDimensionWarning] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Initialize dimensions when metadata arrives
  useEffect(() => {
    if (metadata) {
      setWidth(metadata.width);
      setHeight(metadata.height);
      setDimensionWarning(null);
      setActionError(null);
    }
  }, [metadata]);

  const handleWidthChange = (newWidthVal: number) => {
    const val = Math.max(1, newWidthVal);
    setWidth(val);

    if (aspectRatioLock && metadata) {
      const proportionalHeight = Math.max(1, Math.round(val / metadata.aspectRatio));
      setHeight(proportionalHeight);
      checkDimensionSafety(val, proportionalHeight);
    } else {
      checkDimensionSafety(val, height);
    }
  };

  const handleHeightChange = (newHeightVal: number) => {
    const val = Math.max(1, newHeightVal);
    setHeight(val);

    if (aspectRatioLock && metadata) {
      const proportionalWidth = Math.max(1, Math.round(val * metadata.aspectRatio));
      setWidth(proportionalWidth);
      checkDimensionSafety(proportionalWidth, val);
    } else {
      checkDimensionSafety(width, val);
    }
  };

  const checkDimensionSafety = (w: number, h: number) => {
    const check = validateDimensions(w, h);
    if (!check.valid) {
      setDimensionWarning(check.error || 'Invalid dimensions.');
    } else if (check.warning) {
      setDimensionWarning(check.warning);
    } else {
      setDimensionWarning(null);
    }
  };

  const applyScalePreset = (scale: number) => {
    if (!metadata) return;
    const targetW = Math.max(1, Math.round(metadata.width * scale));
    const targetH = Math.max(1, Math.round(metadata.height * scale));
    setWidth(targetW);
    setHeight(targetH);
    checkDimensionSafety(targetW, targetH);

    const presetCode: PermittedPreset = scale === 0.5 ? 'preset_50_percent' : scale === 0.75 ? 'preset_75_percent' : 'custom';
    trackToolModeSelected({
      toolName: 'resizer',
      actionType: 'preset_select',
      mode: 'dimensions',
      preset: presetCode,
    });
  };

  const applyBoxPreset = (boxW: number, boxH: number) => {
    if (!metadata) return;
    if (aspectRatioLock) {
      const dims = calculateTargetDimensions(metadata.width, metadata.height, boxW, boxH, true);
      setWidth(dims.width);
      setHeight(dims.height);
      checkDimensionSafety(dims.width, dims.height);
    } else {
      setWidth(boxW);
      setHeight(boxH);
      checkDimensionSafety(boxW, boxH);
    }

    const presetCode: PermittedPreset =
      boxW === 1920 && boxH === 1080
        ? 'preset_fhd'
        : boxW === 1280 && boxH === 720
        ? 'preset_hd'
        : boxW === 1200 && boxH === 630
        ? 'preset_web'
        : boxW === 1080 && boxH === 1080
        ? 'preset_square'
        : boxW === 400 && boxH === 400
        ? 'preset_avatar'
        : 'custom';

    trackToolModeSelected({
      toolName: 'resizer',
      actionType: 'preset_select',
      mode: 'dimensions',
      preset: presetCode,
    });
  };

  const handleRunResize = async () => {
    if (!imageElement || !metadata) return;

    setActionError(null);
    const check = validateDimensions(width, height);
    if (!check.valid) {
      setActionError(check.error || 'Invalid dimensions.');
      return;
    }

    setIsProcessing(true);
    clearError();

    trackToolStarted({
      toolName: 'resizer',
      mode: 'dimensions',
    });

    try {
      const mimeType: SupportedMimeType =
        targetFormat === 'original' ? metadata.mimeType : targetFormat;

      const res = await resizeImage(imageElement, {
        targetWidth: width,
        targetHeight: height,
        maintainAspectRatio: aspectRatioLock,
        mimeType,
        quality: quality / 100,
      });

      setResult(res);
      trackProcessingCompleted({
        toolName: 'resizer',
        mode: 'dimensions',
      });
    } catch (err: unknown) {
      let sanitizedCode: PermittedErrorCode = 'unknown_error';
      if (err instanceof ProcessingError) {
        if (err.code === 'DIMENSION_EXCEEDED') sanitizedCode = 'dimensions_exceed_limit';
        else if (err.code === 'PIXEL_AREA_EXCEEDED') sanitizedCode = 'surface_area_exceed_limit';
        else if (err.code === 'CANVAS_ENCODING_FAILED') sanitizedCode = 'canvas_encoding_failed';
        else if (err.code === 'CANVAS_ENCODING_TIMEOUT') sanitizedCode = 'canvas_encoding_timeout';
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Failed to resize image.');
      }
      trackProcessingError('resizer', sanitizedCode);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Maximize2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Image Resizer
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Scale dimensions with aspect ratio lock, resolution presets, and hardware memory protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            Max 8192px Safe Ceiling
          </Badge>
        </div>
      </div>

      {/* Upload Zone */}
      {!file && (
        <DropZone
          onFileSelect={loadFile}
          disabled={isProcessing}
        />
      )}

      {/* Global Alerts */}
      {error && (
        <Alert variant="error" title="Notice" onDismiss={clearError}>
          {error.message}
        </Alert>
      )}

      {actionError && (
        <Alert variant="error" title="Resize Error" onDismiss={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {dimensionWarning && (
        <Alert variant="warning" title="Dimension Limit Notice">
          {dimensionWarning}
        </Alert>
      )}

      {warning && (
        <Alert variant="warning" title="Large Image Advisory">
          {warning}
        </Alert>
      )}

      {/* Active Workspace */}
      {file && metadata && previewUrl && (
        <div className="space-y-6">
          {/* File summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-xs uppercase overflow-hidden border border-emerald-100 dark:border-emerald-900">
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[240px] sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Original: {metadata.width} × {metadata.height} px ({metadata.aspectRatio.toFixed(2)}:1) • {formatBytes(metadata.sizeBytes)}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              disabled={isProcessing}
              className="text-xs"
            >
              Change Image
            </Button>
          </div>

          {/* Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dimension Controls</CardTitle>
              <CardDescription>
                Customize pixel width and height, or apply standard preset dimensions.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Presets Bar */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Resolution & Scale Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {RESOLUTION_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (preset.scale) applyScalePreset(preset.scale);
                        else if (preset.width && preset.height) applyBoxPreset(preset.width, preset.height);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setWidth(metadata.width);
                      setHeight(metadata.height);
                      checkDimensionSafety(metadata.width, metadata.height);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 transition-colors"
                  >
                    Reset (100%)
                  </button>
                </div>
              </div>

              {/* Width / Height Numeric Inputs with Lock */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Width (pixels)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={8192}
                    value={width || ''}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    suffixElement={<span className="text-xs text-slate-400 font-medium">PX</span>}
                  />
                </div>

                {/* Aspect Ratio Lock Toggle */}
                <div className="flex sm:flex-col items-center justify-center pt-2 sm:pt-5">
                  <button
                    type="button"
                    onClick={() => setAspectRatioLock(!aspectRatioLock)}
                    title={aspectRatioLock ? 'Aspect ratio locked' : 'Aspect ratio unlocked (freeform)'}
                    className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${
                      aspectRatioLock
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    {aspectRatioLock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Height (pixels)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={8192}
                    value={height || ''}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    suffixElement={<span className="text-xs text-slate-400 font-medium">PX</span>}
                  />
                </div>
              </div>

              {/* Format & Quality Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Output Format
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="original">Keep Original ({metadata.mimeType.replace('image/', '').toUpperCase()})</option>
                    <option value="image/jpeg">JPEG (.jpg)</option>
                    <option value="image/png">PNG (.png)</option>
                    <option value="image/webp">WebP (.webp)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Compression Quality</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800 mt-2"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleRunResize}
                  disabled={isProcessing || !width || !height}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      <span>Resizing canvas...</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span>Resize to {width} × {height} px</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Comparison Viewer */}
          {result && (
            <ImageComparison
              title="Resizing Complete"
              originalMetadata={metadata}
              originalPreviewUrl={previewUrl}
              result={result}
              onDownload={downloadResult}
              onReset={clear}
            />
          )}
        </div>
      )}
    </Container>
  );
}
