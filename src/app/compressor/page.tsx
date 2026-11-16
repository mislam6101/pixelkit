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
    <Container className="max-w-4xl space-y-8">
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
            Compress JPEG, PNG, and WebP images to exact target KB ceilings or custom quality factors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            Strict $\le$ Target Invariant
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
                          ? `Compress to $\\le$ ${targetKb} KB`
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
    </Container>
  );
}
