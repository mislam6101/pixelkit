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
import { convertImageFormat } from '@/core/converter';
import { ProcessingError, SupportedMimeType } from '@/core/types';
import { formatBytes } from '@/lib/utils';
import { useStagedImage } from '@/context/StagedImageContext';
import {
  trackToolModeSelected,
  trackToolStarted,
  trackProcessingCompleted,
  trackProcessingError,
  PermittedErrorCode,
} from '@/lib/analytics';
import {
  RefreshCw,
  Palette,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

const FORMAT_OPTIONS = [
  {
    mime: 'image/webp' as SupportedMimeType,
    label: 'WebP',
    ext: '.webp',
    tag: 'Modern & Efficient',
    description: 'Best compression, supports transparency, broad modern browser support.',
  },
  {
    mime: 'image/jpeg' as SupportedMimeType,
    label: 'JPEG',
    ext: '.jpg',
    tag: 'Universal Compatibility',
    description: 'Standard format for photographs and documents. Requires solid background fill for transparency.',
  },
  {
    mime: 'image/png' as SupportedMimeType,
    label: 'PNG',
    ext: '.png',
    tag: 'Lossless & Crisp',
    description: 'Lossless quality, full alpha transparency. Ideal for graphics, icons, and screenshots.',
  },
];

const COLOR_SWATCHES = [
  { label: 'White', color: '#FFFFFF' },
  { label: 'Black', color: '#000000' },
  { label: 'Light Gray', color: '#F3F4F6' },
  { label: 'Slate Gray', color: '#334155' },
];

export default function ConverterPage() {
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
  } = useImageProcessor('converter');

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

  const [targetMime, setTargetMime] = useState<SupportedMimeType>('image/webp');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [quality, setQuality] = useState<number>(90);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRunConversion = async () => {
    if (!imageElement || !metadata) return;

    setIsProcessing(true);
    setActionError(null);
    clearError();

    trackToolStarted({
      toolName: 'converter',
      mode: 'transcode',
    });

    try {
      const res = await convertImageFormat(imageElement, {
        targetMimeType: targetMime,
        quality: quality / 100,
        backgroundColor: targetMime === 'image/jpeg' ? backgroundColor : undefined,
      });

      setResult(res);
      trackProcessingCompleted({
        toolName: 'converter',
        mode: 'transcode',
      });
    } catch (err: unknown) {
      let sanitizedCode: PermittedErrorCode = 'unknown_error';
      if (err instanceof ProcessingError) {
        if (err.code === 'CANVAS_ENCODING_FAILED') sanitizedCode = 'canvas_encoding_failed';
        else if (err.code === 'CANVAS_ENCODING_TIMEOUT') sanitizedCode = 'canvas_encoding_timeout';
        else if (err.code === 'INVALID_FILE_TYPE') sanitizedCode = 'invalid_file_type';
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Failed to convert image format.');
      }
      trackProcessingError('converter', sanitizedCode);
    } finally {
      setIsProcessing(false);
    }
  };

  const isConvertingToJpeg = targetMime === 'image/jpeg';
  const hasPotentialAlpha = metadata?.hasAlphaChannel;

  return (
    <Container className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Image Converter
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transcode between JPEG, PNG, and WebP with configurable alpha-flattening and background fill.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            Zero Server Uploads
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
        <Alert variant="error" title="Conversion Notice" onDismiss={() => setActionError(null)}>
          {actionError}
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 font-bold text-xs uppercase overflow-hidden border border-purple-100 dark:border-purple-900">
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
                  Detected:{' '}
                  <span className="font-bold uppercase text-purple-600 dark:text-purple-400">
                    {metadata.mimeType.replace('image/', '')}
                  </span>{' '}
                  • {metadata.width} × {metadata.height} px • {formatBytes(metadata.sizeBytes)}
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

          {/* Format Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Select Target Format</CardTitle>
              <CardDescription>
                Choose the desired output format and configure background fill and quality settings.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Format Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map((opt) => {
                  const isSelected = targetMime === opt.mime;
                  const isSameAsSource = metadata.mimeType === opt.mime;

                  return (
                    <div
                      key={opt.mime}
                      onClick={() => {
                        setTargetMime(opt.mime);
                        trackToolModeSelected({
                          toolName: 'converter',
                          actionType: 'mode_switch',
                          mode: 'transcode',
                        });
                      }}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/60 dark:border-purple-500 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {opt.label}
                        </span>
                        {isSameAsSource ? (
                          <Badge variant="outline" size="sm">
                            Source
                          </Badge>
                        ) : (
                          <Badge variant={isSelected ? 'info' : 'outline'} size="sm">
                            {opt.tag}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Conditional JPEG Alpha Flattening Color */}
              {isConvertingToJpeg && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      JPEG Background Fill (Alpha Flattening)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    JPEG does not support transparency. Any transparent regions in your source image
                    will be cleanly flattened against this background color (prevents black background artifacts).
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5">
                      {COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => setBackgroundColor(swatch.color)}
                          className={`h-7 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                            backgroundColor.toUpperCase() === swatch.color.toUpperCase()
                              ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-600 shadow-xs ring-2 ring-blue-500/20'
                              : 'border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 inline-block"
                            style={{ backgroundColor: swatch.color }}
                          />
                          <span>{swatch.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Hex Color Picker */}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-8 w-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        {backgroundColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Slider (for lossy formats) */}
              {targetMime !== 'image/png' && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Conversion Quality</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Higher Compression</span>
                    <span>90% (Recommended)</span>
                    <span>Maximum Fidelity</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleRunConversion}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      <span>Transcoding image...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>
                        Convert to {targetMime.replace('image/', '').toUpperCase()}
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
              title="Conversion Complete"
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
