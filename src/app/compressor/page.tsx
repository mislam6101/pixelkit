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
import { Toggle } from '@/components/ui/Toggle';
import { ImageComparison } from '@/components/features/ImageComparison';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { compressToTargetKb, compressWithQuality } from '@/core/compressor';
import { ProcessingError } from '@/core/types';
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
  SlidersHorizontal,
  Target,
  Sparkles,
  Info,
  AlertTriangle,
  ArrowRight,
  Settings2,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Maximize2,
  RefreshCw,
  FileCheck,
  Layers,
  Cpu,
} from 'lucide-react';

type CompressionMode = 'targetKb' | 'quality';

const PRESET_TARGETS = [
  { label: '20 KB', kb: 20 },
  { label: '50 KB', kb: 50 },
  { label: '100 KB', kb: 100 },
  { label: '200 KB', kb: 200 },
  { label: '500 KB', kb: 500 },
  { label: '1 MB', kb: 1024 },
];

const COMPRESSOR_FAQS = [
  {
    question: 'Why is PNG unavailable for target-KB compression?',
    answer:
      'Standard web browser Canvas encoders process PNG strictly as a lossless format, ignoring quality compression parameters. To compress an image to an exact target file size (such as 20KB or 50KB), PhotoKit offers to transcode the image to WebP (which preserves alpha transparency while significantly reducing file size) or JPEG (which flattens transparency against a white background).',
  },
  {
    question: 'What happens when an image cannot reach the target file size?',
    answer:
      'If an image has high pixel dimensions or high visual entropy, even encoding at the minimum quality floor (1%) may exceed your requested byte ceiling. In this case, PhotoKit alerts you with an advisory notice. You can either increase the target KB limit or enable the optional "Auto-downscale dimensions" setting to proportionally reduce pixel dimensions until the file size constraint is met.',
  },
  {
    question: 'How does the seven-step quality search work?',
    answer:
      'PhotoKit runs a bounded binary bisection search over image quality factors between 1% and 100%. After checking baseline boundaries, it systematically evaluates quality midpoints over seven discrete iterations to identify the highest quality factor that produces a file size strictly less than or equal to your target byte ceiling.',
  },
  {
    question: 'Does target-KB compression change image dimensions?',
    answer:
      'No. By default, PhotoKit strictly preserves your image\'s original width and height, adjusting only encoding quality factors. Pixel dimensions are only reduced if you explicitly enable the "Auto-downscale dimensions" checkbox.',
  },
  {
    question: 'Can I compress images for online upload size limits?',
    answer:
      'Yes. PhotoKit includes dedicated presets (such as 20 KB, 50 KB, 100 KB, and 200 KB) and custom KB inputs designed to help you meet strict file size thresholds commonly required by job applications, portal forms, and website optimization benchmarks.',
  },
  {
    question: 'What is the difference between target-size and custom-quality modes?',
    answer:
      'Target File Size mode calculates an encoder quality factor dynamically using binary bisection to ensure the output byte count does not exceed a specified ceiling. Custom Quality mode applies a fixed quality percentage (from 1% to 100%) chosen by you, regardless of what the final file size in kilobytes turns out to be.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: COMPRESSOR_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function CompressorPage() {
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
  } = useImageProcessor('compressor');

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

  const [mode, setMode] = useState<CompressionMode>('targetKb');
  const [targetKb, setTargetKb] = useState<number>(50);
  const [qualityPercent, setQualityPercent] = useState<number>(80);
  const [allowDownscale, setAllowDownscale] = useState<boolean>(false);
  const [pngOutputFormat, setPngOutputFormat] = useState<'image/webp' | 'image/jpeg'>('image/webp');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleFileDrop = async (droppedFile: File) => {
    setFeedbackError(null);
    await loadFile(droppedFile);
  };

  const handleRunCompression = async () => {
    if (!imageElement || !metadata) return;

    setIsProcessing(true);
    setFeedbackError(null);
    clearError();

    const selectedPreset: PermittedPreset | undefined =
      mode === 'targetKb'
        ? targetKb === 20
          ? 'preset_20kb'
          : targetKb === 50
          ? 'preset_50kb'
          : targetKb === 100
          ? 'preset_100kb'
          : targetKb === 200
          ? 'preset_200kb'
          : targetKb === 500
          ? 'preset_500kb'
          : targetKb === 1024
          ? 'preset_1mb'
          : 'custom'
        : undefined;

    trackToolStarted({
      toolName: 'compressor',
      mode: mode === 'targetKb' ? 'target_kb' : 'quality',
      preset: selectedPreset,
    });

    try {
      if (mode === 'targetKb') {
        const targetBytes = targetKb * 1024;
        const mimeType =
          metadata.mimeType === 'image/png' ? pngOutputFormat : metadata.mimeType;

        const res = await compressToTargetKb(imageElement, {
          targetBytes,
          mimeType,
          allowDownscale,
        });

        setResult(res);
        trackProcessingCompleted({
          toolName: 'compressor',
          mode: 'target_kb',
        });
      } else {
        // Quality Mode
        const quality = qualityPercent / 100;
        const mimeType =
          metadata.mimeType === 'image/png' ? pngOutputFormat : metadata.mimeType;

        const res = await compressWithQuality(imageElement, {
          quality,
          mimeType,
        });

        setResult(res);
        trackProcessingCompleted({
          toolName: 'compressor',
          mode: 'quality',
        });
      }
    } catch (err: unknown) {
      let sanitizedCode: PermittedErrorCode = 'unknown_error';
      if (err instanceof ProcessingError) {
        if (err.code === 'TARGET_UNREACHABLE_AT_MIN_QUALITY') {
          sanitizedCode = 'target_unreachable';
          setFeedbackError(
            `${err.message} Tip: Enable "Auto-downscale dimensions" below, or increase the target KB limit.`
          );
        } else if (err.code === 'CANVAS_ENCODING_FAILED') {
          sanitizedCode = 'canvas_encoding_failed';
          setFeedbackError(err.message);
        } else if (err.code === 'CANVAS_ENCODING_TIMEOUT') {
          sanitizedCode = 'canvas_encoding_timeout';
          setFeedbackError(err.message);
        } else {
          setFeedbackError(err.message);
        }
      } else if (err instanceof Error) {
        setFeedbackError(err.message);
      } else {
        setFeedbackError('An error occurred during compression.');
      }
      trackProcessingError('compressor', sanitizedCode);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPng = metadata?.mimeType === 'image/png';

  return (
    <>
      <meta
        name="description"
        content="Compress JPG and WebP images to target file-size limits (20KB, 50KB, 100KB) or custom quality directly in your browser. Images are processed locally in your browser and are not uploaded to our servers."
      />
      {/* Inject Structured Data for Search & AI Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Container className="max-w-4xl space-y-12 py-4 sm:py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Image Compressor
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compress JPG and WebP images to target file-size limits (20KB, 50KB, 100KB) or custom quality directly in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            Strict ≤ Target Invariant
          </Badge>
        </div>
      </div>

      {/* Upload Zone (shown when no file loaded) */}
      {!file && (
        <DropZone
          onFileSelect={handleFileDrop}
          disabled={isProcessing}
        />
      )}

      {/* Global Alerts & Error Notices */}
      {error && (
        <Alert
          variant="error"
          title="Image Processing Notice"
          onDismiss={clearError}
        >
          {error.message}
        </Alert>
      )}

      {feedbackError && (
        <Alert
          variant="warning"
          title="Compression Target Notice"
          onDismiss={() => setFeedbackError(null)}
        >
          {feedbackError}
        </Alert>
      )}

      {warning && (
        <Alert variant="warning" title="Large Image Advisory">
          {warning}
        </Alert>
      )}

      {/* Tool Workspace (shown when file is loaded) */}
      {file && metadata && previewUrl && (
        <div className="space-y-6">
          {/* Active File Summary Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold text-xs uppercase overflow-hidden border border-blue-100 dark:border-blue-900">
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
                  {metadata.width} × {metadata.height} px • {formatBytes(metadata.sizeBytes)} •{' '}
                  <span className="uppercase font-medium text-slate-700 dark:text-slate-300">
                    {metadata.mimeType.replace('image/', '')}
                  </span>
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

          {/* PNG Lossless Notice & Format Conversion Options */}
          {isPng && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>PNG Format Optimization Notice</span>
              </div>
              <p className="leading-relaxed">
                Standard browser Canvas encoders treat PNG as strictly lossless, ignoring quality factors.
                To compress this image to an exact target file size or lower quality, select an output format:
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="pngFormat"
                    value="image/webp"
                    checked={pngOutputFormat === 'image/webp'}
                    onChange={() => setPngOutputFormat('image/webp')}
                    className="text-blue-600"
                  />
                  <span>WebP (Recommended — preserves transparency, 30–80% smaller)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="pngFormat"
                    value="image/jpeg rank"
                    checked={pngOutputFormat === 'image/jpeg'}
                    onChange={() => setPngOutputFormat('image/jpeg')}
                    className="text-blue-600"
                  />
                  <span>JPEG (Solid white background fill)</span>
                </label>
              </div>
            </div>
          )}

          {/* Controls Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compression Settings</CardTitle>
                  <CardDescription>
                    Select target file size or manual quality compression.
                  </CardDescription>
                </div>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('targetKb');
                      trackToolModeSelected({
                        toolName: 'compressor',
                        actionType: 'mode_switch',
                        mode: 'target_kb',
                      });
                    }}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      mode === 'targetKb'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Target File Size</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('quality');
                      trackToolModeSelected({
                        toolName: 'compressor',
                        actionType: 'mode_switch',
                        mode: 'quality',
                      });
                    }}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      mode === 'quality'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quality Percentage</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {mode === 'targetKb' ? (
                /* Target-KB Mode */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Target File Size Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TARGETS.map((preset) => {
                        const isSelected = targetKb === preset.kb;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setTargetKb(preset.kb);
                              const pCode: PermittedPreset =
                                preset.kb === 20
                                  ? 'preset_20kb'
                                  : preset.kb === 50
                                  ? 'preset_50kb'
                                  : preset.kb === 100
                                  ? 'preset_100kb'
                                  : preset.kb === 200
                                  ? 'preset_200kb'
                                  : preset.kb === 500
                                  ? 'preset_500kb'
                                  : preset.kb === 1024
                                  ? 'preset_1mb'
                                  : 'custom';
                              trackToolModeSelected({
                                toolName: 'compressor',
                                actionType: 'preset_select',
                                mode: 'target_kb',
                                preset: pCode,
                              });
                            }}
                            className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Custom Target (Kilobytes)
                    </label>
                    <Input
                      type="number"
                      min={5}
                      max={50000}
                      value={targetKb}
                      onChange={(e) => setTargetKb(Math.max(1, parseInt(e.target.value) || 0))}
                      suffixElement={<span className="text-xs text-slate-400 font-medium">KB</span>}
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Target: {targetKb} KB ({formatBytes(targetKb * 1024)})
                    </p>
                  </div>

                  {/* Auto-downscale option (Strict invariant: unchecked by default) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowDownscale}
                        onChange={(e) => setAllowDownscale(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700"
                      />
                      <div className="text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">
                          Auto-downscale dimensions if target size cannot be reached
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          By default, original dimensions ({metadata.width}×{metadata.height}) are strictly preserved.
                          Enable this if an image has too much visual entropy to reach your KB target even at 1% quality.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                /* Quality Mode */
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-700 dark:text-slate-300">Image Quality</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {qualityPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={qualityPercent}
                      onChange={(e) => setQualityPercent(parseInt(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      <span>1% (Smallest File)</span>
                      <span>50% (Balanced)</span>
                      <span>80% (Recommended)</span>
                      <span>100% (Highest Quality)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleRunCompression}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      <span>
                        {mode === 'targetKb' ? 'Running 7-step bisection...' : 'Encoding canvas...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>
                        {mode === 'targetKb'
                          ? `Compress to ${targetKb} KB or less`
                          : `Compress at ${qualityPercent}% Quality`}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Comparison Viewer */}
          {result && (
            <ImageComparison
              title="Compression Complete"
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
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>How to Compress Images to a Target File Size</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Images are processed locally in your browser and are not uploaded to our servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upload Your Image</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag and drop any JPG, PNG, or WebP photo up to 8192px into the drop zone. Files are verified locally via binary magic bytes without transmitting image data to PhotoKit&apos;s servers.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Set KB Ceiling or Quality</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose a preset target (20 KB, 50 KB, 100 KB, 200 KB, 500 KB, 1 MB) or type a custom KB limit. If uploading PNG, select WebP or JPEG because standard browser Canvas treats PNG as lossless.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">3</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Inspect & Download</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click Compress to execute the 7-step bisection search. Inspect the side-by-side split comparison viewer to evaluate visual clarity before downloading the optimized file.
              </p>
            </div>
          </div>
        </section>

        {/* B. Algorithmic Mechanics */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>How PhotoKit&apos;s Target-KB Compression Works</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              An algorithmic approach to file size optimization that eliminates manual trial-and-error slider adjustments.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-5">
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Meeting strict upload size requirements on conventional tools usually forces users to repeatedly guess quality percentages until the output file fits under the threshold. PhotoKit automates this process using a bounded binary bisection search:
              </p>
              <ul className="space-y-2.5 pt-1 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100">Boundary Pre-flight Checks:</strong> The engine first probes maximum quality (100%). If the uncompressed canvas export already satisfies your target, it returns immediately with zero compression loss. Next, it tests minimum quality (1%). If the file cannot reach the target even at 1% quality, PhotoKit flags the target as unreachable rather than delivering a file that exceeds your limit.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100">Bounded Seven-Step Bisection:</strong> If the target falls within range, the algorithm bisects quality intervals across seven iterations, testing the midpoint candidate each round. It locates the highest quality setting where output bytes strictly do not exceed your requested ceiling (&le; targetBytes).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100">Optional Downscaling Safeguard:</strong> By default, PhotoKit preserves original width and height without downscaling. However, high-resolution camera photos with complex visual entropy may physically exceed a tiny byte limit (such as 20KB) at full resolution. Checking &ldquo;Auto-downscale dimensions&rdquo; permits the engine to reduce dimensions by 15% per pass (multiplying width and height by 0.85, up to 5 passes down to a 100px floor) until the byte budget is met.
                  </span>
                </li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                *Note: PhotoKit finds the optimal quality factor within its discrete seven-iteration budget. It does not claim continuous mathematical global optimality or guarantee that every high-resolution photo can fit into an arbitrary micro-budget without dimension scaling.
              </p>
            </div>
          </div>
        </section>

        {/* C. Supported Formats & Rules */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Supported Formats & Technical Compression Rules</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Understanding browser Canvas encoder behavior across web image formats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">JPEG (.jpg, .jpeg)</h3>
                <Badge variant="outline" size="sm">Lossy Target-KB</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fully supported for target-KB and custom quality compression. Ideal for photographic content. JPEG does not support alpha transparency; any transparent pixels in source images are flattened against a solid background fill.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">WebP (.webp)</h3>
                <Badge variant="outline" size="sm">Recommended</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fully supported for target-KB and custom quality modes. WebP provides superior lossy compression while preserving full alpha channel transparency, typically yielding files 30% to 80% smaller than JPEG or PNG.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">PNG (.png)</h3>
                <Badge variant="outline" size="sm">Lossless Only</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard browser Canvas encoders treat PNG strictly as a lossless format, ignoring quality parameters. When a PNG is uploaded for target-KB compression, PhotoKit requires selecting WebP (preserves transparency) or JPEG (white background).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Target KB vs. Quality Mode</h3>
                <Badge variant="outline" size="sm">Two Modes</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Target File Size mode calculates an encoder quality factor dynamically using binary bisection to enforce a strict byte limit. Quality Percentage mode applies a fixed compression setting (such as 80%) chosen by you, regardless of the resulting file size.
              </p>
            </div>
          </div>
        </section>

        {/* D. Practical Use Cases */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Practical Applications for Target-KB Compression</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Common scenarios where precise byte ceilings or bandwidth reduction are essential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Online Form Upload Caps</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Job portals, passport applications, academic registration forms, and government portals frequently reject photo uploads exceeding 20KB, 50KB, or 100KB. Using target size presets ensures your file stays strictly below submission limits without manual trial and error.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Website Image Optimization</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Oversized banner images degrade Core Web Vitals, particularly Largest Contentful Paint (LCP). Compressing hero graphics and blog imagery to under 100KB–200KB significantly cuts network payload and speeds up page loading on mobile devices.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Email & Messaging Attachments</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Email servers and messaging platforms often restrict attachment sizes or aggressively compress images during transmission. Compressing photos before attaching ensures they fit under email size quotas while retaining sharpness.
              </p>
            </div>
          </div>
        </section>

        {/* E. Interactive FAQ Accordion */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Frequently Asked Questions About Image Compression</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Technical answers reflecting verified compressor engine behavior.
            </p>
          </div>

          <div className="space-y-3">
            {COMPRESSOR_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                <summary className="flex w-full cursor-pointer list-none items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 group-open:rotate-180 group-open:text-blue-600 dark:group-open:text-blue-400" />
                </summary>
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* F. Related Tools Navigation */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Online Image Resizer</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Scale pixel dimensions proportionally with aspect-ratio locks or quick resolution presets (Full HD, HD, Web, Avatar). Perfect when an image must be downscaled to fit portal dimension limits.
                </p>
              </div>
              <Link
                href="/resizer/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors pt-1"
              >
                <span>Launch Image Resizer</span>
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
