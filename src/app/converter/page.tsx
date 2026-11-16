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
  ChevronDown,
  HelpCircle,
  SlidersHorizontal,
  Maximize2,
  Layers,
  Cpu,
  ArrowRight,
  FileCheck,
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

const CONVERTER_FAQS = [
  {
    question: 'Why does converting a transparent PNG to JPEG require a background color?',
    answer:
      'JPEG does not support an alpha transparency channel. Transparent areas must therefore be represented using a solid color in the JPEG output. PhotoKit fills the Canvas with the selected matte color before drawing the source image. White (#FFFFFF) is the default background color.',
  },
  {
    question: 'Does converting a JPEG to PNG improve image quality?',
    answer:
      'No. PNG uses lossless encoding, but it cannot restore image information or compression artifacts lost during earlier JPEG encoding. Converting JPEG to PNG does not recover the original image quality.',
  },
  {
    question: 'Why does the quality slider disappear when selecting PNG?',
    answer:
      'The converter uses browser Canvas encoding. PNG output is encoded without a lossy quality parameter, so the quality slider is not applicable. The slider is available for JPEG and WebP output.',
  },
  {
    question: 'Which image format should I use for a website?',
    answer:
      'The best format depends on the image and use case. WebP supports both lossy and lossless encoding and transparency, while JPEG is widely compatible for photographs and PNG is useful for lossless graphics and transparency. Compare visual quality, file size, and compatibility before choosing.',
  },
  {
    question: 'Can I convert animated GIF or animated WebP files?',
    answer:
      'GIF is not supported as an input format by PhotoKit. Animated WebP may pass input validation, but Canvas processing captures the first frame and produces a static output. Multi-frame animation is not preserved.',
  },
  {
    question: 'Why does PhotoKit enforce an 8192px dimension limit?',
    answer:
      'Large images can require substantial browser memory during Canvas processing. PhotoKit enforces a maximum single dimension of 8192px and a separate maximum pixel area of 16,777,216 pixels. Both limits must be satisfied before processing.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CONVERTER_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

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

      {/* ================================================================= */}
      {/* EDUCATIONAL & SEO CONTENT (POSITIONED STRICTLY BELOW WORKSPACE)   */}
      {/* ================================================================= */}
      <div className="space-y-12 sm:space-y-16 border-t border-slate-200 dark:border-slate-800 pt-10 sm:pt-14">
        {/* A. Usage Guide */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>How to Convert Image Formats in 3 Steps</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Images are processed locally in your browser and are not uploaded to our servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-bold">1</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upload Your Image</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload JPEG, PNG, or WebP images within the supported limits: a maximum single dimension of 8192px and a maximum total pixel area of 16,777,216 pixels. The application validates binary file signatures (magic bytes) rather than trusting file extensions alone. Image processing takes place locally in your browser, and images are not uploaded to PhotoKit servers.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-bold">2</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Select a Target Format and Configure Options</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose WebP, JPEG, or PNG. JPEG conversion provides a background matte color option to represent transparent areas cleanly. JPEG and WebP support lossy quality controls, while PNG output does not expose a quality slider because its Canvas encoding is lossless.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-bold">3</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Convert and Download</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Start the conversion with one click. Review the resulting image dimensions, file size, and visual quality using the side-by-side comparison interface before downloading your converted output file.
              </p>
            </div>
          </div>
        </section>

        {/* B. Format Comparison Guide */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>JPEG vs. PNG vs. WebP: Format Comparison Guide</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Comparing encoding characteristics, transparency support, and practical use cases across web image formats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">WebP — Efficient Modern Image Format</h3>
                <Badge variant="outline" size="sm">Modern</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Supports lossy and lossless encoding as well as full alpha transparency. WebP can offer smaller file sizes than JPEG at comparable visual quality, depending on the image and encoding settings, making it useful for modern websites and digital platforms.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">JPEG — Widely Compatible Photographic Format</h3>
                <Badge variant="outline" size="sm">Universal</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Uses lossy compression optimized for photographs, artwork, and continuous-tone images. JPEG does not support alpha transparency and requires a solid background matte when converting transparent images, with configurable output quality in this converter.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">PNG — Lossless Image Format</h3>
                <Badge variant="outline" size="sm">Lossless</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Uses lossless encoding without additional lossy compression, making it useful for screenshots, logos, graphics, and images requiring transparency or sharp visual details.
              </p>
            </div>
          </div>
        </section>

        {/* C. Transparency & Matte Fills */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Handling Transparency and JPEG Background Matte Fills</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Preventing dark background artifacts when transcoding transparent assets to JPEG.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                The JPEG format does not support transparency. When converting an image with transparent regions to JPEG, transparent Canvas pixels may appear black in JPEG output without an explicit background fill.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                PhotoKit resolves this by pre-filling the Canvas surface with your selected matte color before drawing the source image onto it. The default JPEG background color is clean white (<code className="font-mono text-purple-600 dark:text-purple-400 text-xs">#FFFFFF</code>).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Available Preset &amp; Custom Matte Colors</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  You can quickly select between four standard presets: <strong>White (#FFFFFF)</strong>, <strong>Black (#000000)</strong>, <strong>Light Gray (#F3F4F6)</strong>, and <strong>Slate Gray (#334155)</strong>. A native custom color picker is also provided to match exact branding hex codes.
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Transparency in PNG &amp; WebP Output</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  When converting to PNG or WebP, the background color fill is disabled. The Canvas surface is cleared before rendering, preserving full alpha transparency across transparent PNG and WebP source files through the current conversion implementation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* D. Browser Guardrails & Format Limitations */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Browser Processing, Memory Guardrails, and Format Limitations</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Understanding client-side execution boundaries, canvas memory safety ceilings, and supported formats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">8192px Maximum Single Dimension</h3>
                <Badge variant="outline" size="sm">Dimension Cap</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                PhotoKit enforces a verified maximum single-dimension ceiling of 8192px. Any image whose width or height exceeds 8192 pixels is rejected as a browser memory and Canvas-processing guardrail to ensure stable in-browser execution.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">16.7-Megapixel Maximum Pixel Area</h3>
                <Badge variant="outline" size="sm">Area Ceiling</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Total canvas pixel area is capped at 16,777,216 pixels (~16.7 megapixels). These are separate limits: an image measuring 8192 × 8192 pixels exceeds the pixel-area ceiling (67.1 megapixels) and is not accepted merely because each dimension is within 8192px.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Browser Memory Advisory and Canvas Encoding</h3>
                <Badge variant="outline" size="sm">Memory &amp; Retry</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A non-blocking advisory is triggered when a dimension exceeds 4096px. Canvas encoding has a 6000ms timeout. The implementation includes one controlled retry for unexpected canvas encoding failures; timeouts are not retried.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">Input Format Verification &amp; Animated Files:</span>
            <p>
              PhotoKit strictly validates input images via binary magic byte signatures for JPEG, PNG, and WebP. Formats like GIF, SVG, AVIF, HEIC, TIFF, BMP, and RAW are not included in the supported input whitelist and are rejected.
            </p>
            <p>
              GIF is not supported as an input format. While animated WebP files may pass initial format validation, browser Canvas 2D processing captures only the first frame and produces a static output. Multi-frame animation is not preserved.
            </p>
          </div>
        </section>

        {/* E. Common Scenarios */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Common Image Conversion Scenarios and Best Practices</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Practical conversion workflows for digital creators, web developers, and document workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">PNG to WebP</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Modern web delivery with transparency support. Converting transparent PNG graphics to WebP maintains full alpha channel transparency while reducing file size. Exact file-size savings depend on the source image complexity and encoding quality settings.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">WebP to PNG</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Useful when a workflow or legacy desktop software requires PNG compatibility or lossless PNG output. Converting to PNG cannot restore image information or compression artifacts lost during earlier lossy encoding.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">PNG to JPEG</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Useful when a solid background is preferred or required by forms, portals, or printing workflows. Selecting an appropriate matte background color (such as white) cleanly fills transparent regions without dark silhouette artifacts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">JPEG to WebP</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Useful when modern web delivery is desired for photographic libraries and website banners. Output quality and final file size depend on the selected quality slider setting.
              </p>
            </div>
          </div>
        </section>

        {/* F. FAQ Accordion */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Frequently Asked Questions About Image Conversion</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Technical answers reflecting verified converter engine behavior.
            </p>
          </div>

          <div className="space-y-3">
            {CONVERTER_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                <summary className="flex w-full cursor-pointer list-none items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 group-open:rotate-180 group-open:text-purple-600 dark:group-open:text-purple-400" />
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
              <SlidersHorizontal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Explore More PhotoKit Image Tools</span>
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
                  Compress JPG and WebP files to target file-size limits (20KB, 50KB, 100KB) or custom quality settings directly in your browser.
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Image Resizer</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Scale image dimensions proportionally with aspect-ratio locks or resolution presets (Full HD, HD, Web, Square, Avatar) directly in your browser.
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
          </div>
        </section>
      </div>
    </Container>
  </>
);
}
