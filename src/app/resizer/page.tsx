'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  SlidersHorizontal,
  FileCheck,
  Layers,
  Cpu,
  ArrowRight,
  Shield,
  Monitor,
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

const RESIZER_FAQS = [
  {
    question: 'How does the Aspect Ratio Lock prevent image distortion?',
    answer:
      'When the Aspect Ratio Lock is enabled (the default setting), modifying either the width or height automatically calculates the other dimension using the photo\'s original aspect ratio. This ensures your image scales proportionally without unnatural horizontal or vertical stretching, squishing, or distortion.',
  },
  {
    question: 'What happens when I select an FHD preset for a vertical photo?',
    answer:
      'PhotoKit applies a bounding-box fitting algorithm (Math.min of the width and height ratios). For example, applying the Full HD preset (1920×1080) to a 1200×1600 portrait photo scales it to 810×1080 px. The entire image fits within the 1920×1080 boundary with zero cropping and zero distortion.',
  },
  {
    question: 'Can I stretch an image to custom dimensions without locking proportions?',
    answer:
      'Yes. By clicking the lock icon to toggle Aspect Ratio Lock off, you can enter any custom width and height independently, or select presets to force exact pixel targets. Note that if the new dimensions do not match your original proportions, the image will be visually stretched or compressed to fill the canvas.',
  },
  {
    question: 'Why does PhotoKit enforce an 8192px dimension ceiling and pixel-area limit?',
    answer:
      'To ensure stability and protect your device from memory exhaustion or browser tab crashes, PhotoKit caps individual dimensions at 8192 px and total canvas surface area at 16,777,216 pixels (~16.7 megapixels). Additionally, a mobile advisory appears for dimensions exceeding 4096 px to prevent performance degradation on handheld hardware.',
  },
  {
    question: 'Does upscaling a small photo to a higher resolution increase its quality?',
    answer:
      'No. Increasing pixel dimensions above the source resolution prompts the browser\'s HTML5 Canvas engine to interpolate existing pixel data using bicubic smoothing. While this softens pixelation and avoids jagged stair-stepping artifacts, it cannot restore or invent optical detail that was absent in the original capture.',
  },
  {
    question: 'Can I convert the image format while resizing?',
    answer:
      'Yes. You can preserve the original format or transcode the resized canvas to JPEG, PNG, or WebP. When converting to JPEG, transparent areas are automatically matted with a clean white background (#FFFFFF). PNG delivers lossless output while ignoring quality sliders, and WebP offers high-efficiency lossy compression with full alpha transparency support.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: RESIZER_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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

      {/* ================================================================= */}
      {/* EDUCATIONAL & SEO CONTENT (POSITIONED STRICTLY BELOW WORKSPACE)   */}
      {/* ================================================================= */}
      <div className="space-y-12 sm:space-y-16 border-t border-slate-200 dark:border-slate-800 pt-10 sm:pt-14">
        {/* A. Usage Guide */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>How to Resize Image Dimensions in 3 Steps</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Images are processed locally in your browser and are not uploaded to our servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold">1</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upload Your Image</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag and drop any JPG, PNG, or WebP photo up to 8192px into the drop zone. Files are verified locally via binary magic bytes without transmitting image data to PhotoKit&apos;s servers.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold">2</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Adjust Width, Height, or Select Presets</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep the Aspect Ratio Lock enabled to scale dimensions proportionally, unlock it for custom freeform stretching, or pick from popular presets like Full HD, Social Web, or Square.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold">3</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Choose Format &amp; Download</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Preserve the original format or transcode to JPEG, PNG, or WebP with adjustable quality control. Inspect the real-time dimension and byte comparison before downloading.
              </p>
            </div>
          </div>
        </section>

        {/* B. Understanding Aspect Ratio Lock */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Understanding Aspect Ratio Lock &amp; Proportional Scaling</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              How mathematical constraints preserve image geometry and eliminate distortion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Aspect Ratio Lock Enabled (Default)</h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Proportional Geometry Protection</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Aspect Ratio Lock is active by default. When you adjust the width, the height is automatically computed using the ratio formula:
              </p>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div>Height = Math.round(Width / (sourceWidth / sourceHeight))</div>
                <div>Width = Math.round(Height * (sourceWidth / sourceHeight))</div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This guarantees your subjects, landscapes, and graphics retain their true proportions with zero squishing or elongation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Unlocked Freeform Mode</h3>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Independent Dimension Control</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Clicking the lock icon releases the proportional constraint, allowing you to specify arbitrary pixel values for width and height independently.
              </p>
              <div className="rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 p-3 text-[11px] text-amber-800 dark:text-amber-300">
                <strong>Visual Distortion Notice:</strong> In freeform mode, if your entered dimensions differ from the original aspect ratio, the image is stretched or compressed across the canvas to fill the new dimensions.
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Use unlocked mode when you need to match strict rectangular slot requirements that do not match the original photo shape.
              </p>
            </div>
          </div>
        </section>

        {/* C. How Resolution Presets Work */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>How Resolution Presets &amp; Bounding-Box Fitting Work</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Intelligent bounding-box scaling without unexpected cropping or aspect alteration.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Bounding-Box Fitting (Zero Cropping Guarantee)</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                When you click a preset resolution while the Aspect Ratio Lock is enabled, PhotoKit treats the preset dimensions as a <strong>bounding box</strong> rather than a rigid rectangle. It evaluates both horizontal and vertical scale ratios and scales according to the more restrictive dimension:
              </p>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                scale = Math.min(presetWidth / sourceWidth, presetHeight / sourceHeight)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Verified Scaling Example</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consider a vertical portrait photo measuring <strong>1200 × 1600 px</strong>. Selecting the <strong>FHD (1920×1080)</strong> preset scales the image to fit entirely within the 1080px height constraint:
                </p>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Result: 810 × 1080 px (100% visible, zero cropped pixels)
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Unlocked Preset Behavior</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If you unlock the Aspect Ratio Lock before choosing a preset, PhotoKit forces the canvas to exact preset coordinates (e.g. exactly 1920×1080 px). If the source image was portrait, it will be stretched horizontally to fill the widescreen canvas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* D. Browser Guardrails & 8192px Ceiling */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Browser Hardware Guardrails &amp; the 8192px Safety Ceiling</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Architectural memory thresholds that keep client-side canvas processing stable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">8192px Dimension Cap</h3>
                <Badge variant="outline" size="sm">Hard Limit</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                PhotoKit strictly enforces a maximum single dimension of 8,192 pixels. This prevents canvas coordinate overflow beyond standard browser implementation limits and GPU texture buffer boundaries.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">16.7M Pixel Surface Cap</h3>
                <Badge variant="outline" size="sm">Area Ceiling</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Total canvas pixel area is capped at 16,777,216 pixels (~16.7 megapixels, equivalent to 4096×4096 px). This constraint protects devices against abrupt Out-Of-Memory (OOM) browser tab terminations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">4096px Mobile Advisory</h3>
                <Badge variant="outline" size="sm">Advisory</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Images with dimensions exceeding 4,096 pixels trigger an advisory notice. Handheld mobile browsers with constrained RAM can experience lag when allocating uncompressed RGBA pixel buffers at this scale.
              </p>
            </div>
          </div>
        </section>

        {/* E. Standard Dimensions Guide */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Standard Dimensions for Web, Social Media &amp; Avatars</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Practical guidelines for PhotoKit presets across common digital distribution channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Full HD (1080p)</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">1920 × 1080</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                16:9 widescreen format ideal for desktop presentations, video backdrops, blog header hero banners, and digital display screens.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">HD (720p)</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">1280 × 720</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard 16:9 high-definition format suited for fast-loading web graphics, video thumbnails, and email newsletters.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Web / Social Share</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">1200 × 630</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard 1.91:1 OpenGraph ratio for Facebook feed links, LinkedIn cards, Twitter/X previews, and messaging link unfurls.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Square Post</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">1080 × 1080</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard 1:1 square resolution optimized for Instagram grid publications, ecommerce product galleries, and marketplace thumbnails.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile Avatar</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">400 × 400</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                High-density 1:1 compact resolution designed for user accounts, forum author avatars, team bios, and community profiles.
              </p>
            </div>
          </div>
        </section>

        {/* F. Interactive FAQ Accordion */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Frequently Asked Questions About Image Resizing</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Technical answers reflecting verified resizer engine behavior.
            </p>
          </div>

          <div className="space-y-3">
            {RESIZER_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                <summary className="flex w-full cursor-pointer list-none items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 group-open:rotate-180 group-open:text-emerald-600 dark:group-open:text-emerald-400" />
                </summary>
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* G. Related Tools Navigation */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Explore Additional PhotoKit Image Tools</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Complementary client-side utilities engineered with the same privacy and memory safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Image Compressor</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Compress JPG and WebP files to exact target kilobyte thresholds (20KB, 50KB, 100KB) using an intelligent binary search engine running entirely in your browser.
                </p>
              </div>
              <Link
                href="/compressor/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors pt-1"
              >
                <span>Launch Image Compressor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Image Format Converter</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Transcode bidirectionally between JPEG, PNG, and WebP with configurable alpha-channel matte background fills and custom quality sliders running 100% locally.
                </p>
              </div>
              <Link
                href="/converter/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors pt-1"
              >
                <span>Launch Image Converter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Container>
  </>
);
}
