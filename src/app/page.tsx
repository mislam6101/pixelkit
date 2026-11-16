'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DropZone } from '@/components/ui/DropZone';
import { Button } from '@/components/ui/Button';
import {
  SlidersHorizontal,
  Maximize2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Image as ImageIcon,
  Check,
  FileCheck,
  Smartphone,
  Eye,
  Sliders,
  Scale,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { useStagedImage } from '@/context/StagedImageContext';
import { trackFileSelected } from '@/lib/analytics';

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { stageFile, clearStagedFile } = useStagedImage();

  // Interactive Smart Tool Selector state
  const [selectedToolTab, setSelectedToolTab] = useState<'compress' | 'resize' | 'convert'>('compress');

  // Interactive Explainer state
  const [explainerQuality, setExplainerQuality] = useState<'high' | 'balanced' | 'compact'>('balanced');

  const handleHomepageFileSelect = (file: File) => {
    setSelectedFile(file);
    stageFile(file);
    trackFileSelected('homepage');
  };

  const handleStageAndNavigate = (href: string) => {
    if (selectedFile) {
      stageFile(selectedFile);
    }
  };

  // Visible FAQ Content (Single Source of Truth for UI & Structured Data)
  const faqs = [
    {
      question: 'Is PhotoKit completely free to use?',
      answer:
        'Yes. PhotoKit is 100% free with no subscriptions, accounts, or usage quotas. Because all image processing executes locally in your browser using HTML5 Canvas, zero server compute overhead is incurred.',
    },
    {
      question: 'Are my images uploaded to any remote server or cloud?',
      answer:
        'No. PhotoKit is designed from the ground up as a client-side utility. Your images never travel over the network; compression, resizing, and transcoding occur entirely within isolated browser memory on your device.',
    },
    {
      question: 'How do I compress an image to an exact 50KB or 20KB file size?',
      answer:
        'Upload your image to the Image Compressor, select "Target File Size" mode, click the 50 KB or 20 KB preset, and click Compress. PhotoKit runs a 7-step binary bisection algorithm to identify the highest possible visual quality factor whose output bytes strictly do not exceed your target threshold.',
    },
    {
      question: 'Which image formats does PhotoKit support?',
      answer:
        'PhotoKit supports JPEG (.jpg, .jpeg), PNG (.png), and WebP (.webp). You can compress, resize, or transcode between any combination of these three formats.',
    },
    {
      question: 'What is the difference between JPG, PNG, and WebP?',
      answer:
        'JPG is standard for photographs and gradients without transparency. PNG is lossless and supports transparent alpha channels, but produces larger file sizes. WebP is a modern web standard that combines transparent channels with superior lossy compression, generating files 30% to 80% smaller than JPG or PNG.',
    },
    {
      question: 'Can I resize an image without changing its aspect ratio?',
      answer:
        'Yes. In the Image Resizer, the Aspect Ratio Lock is turned on by default. Entering a new width automatically adjusts the height proportionally to prevent any stretching or distortion.',
    },
    {
      question: 'Does PhotoKit work on mobile phones and tablets?',
      answer:
        'Yes. PhotoKit is fully responsive and functions seamlessly on mobile Safari and Chrome. In addition, built-in memory safeguards prevent mobile browser crashes when handling large camera photos.',
    },
  ];

  // Structured Data for SEO / AEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://photokit-app.pages.dev/#website',
        url: 'https://photokit-app.pages.dev',
        name: 'PhotoKit',
        description: 'Free, private, browser-native image compressor, resizer, and converter running 100% locally on your device.',
        publisher: {
          '@type': 'Organization',
          name: 'PhotoKit',
          url: 'https://photokit-app.pages.dev',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://photokit-app.pages.dev/#webapp',
        name: 'PhotoKit Image Studio',
        url: 'https://photokit-app.pages.dev',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any (Web Browser)',
        browserRequirements: 'Requires HTML5 Canvas and JavaScript support',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Compress JPG, PNG, and WebP to exact target KB ceilings (20KB, 50KB, 100KB)',
          'Resize pixel dimensions with aspect ratio lock up to 8192px',
          'Convert between JPG, PNG, and WebP with alpha-channel background fill',
          'Zero cloud uploads — 100% client-side browser processing',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://photokit-app.pages.dev/#faq',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  const smartToolContent = {
    compress: {
      title: 'Compress Image to Exact File Sizes',
      tagline: 'Meet strict upload size limits (e.g., job portals, passport forms, web performance) without visible pixel distortion.',
      bullets: [
        'Guaranteed mathematical ceiling: Output size $\\le$ Target KB using a bounded 7-step bisection algorithm.',
        'Quick presets: 20 KB, 50 KB, 100 KB, 200 KB, 500 KB, and 1 MB.',
        'PNG smart optimization notice: Automatically recommends WebP conversion when lossy compression of transparent PNGs is required.',
      ],
      ctaText: 'Open Image Compressor',
      href: '/compressor/',
      icon: <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      accentColor: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    },
    resize: {
      title: 'Resize Dimensions with Aspect Ratio Lock',
      tagline: 'Scale pixel dimensions precisely for social banners, e-commerce thumbnails, avatars, or full HD displays.',
      bullets: [
        'Proportional lock: Prevents stretching by calculating exact geometric ratios on input.',
        'Quick resolution presets: Avatar (400×400), Web (1200×630), HD (1280×720), and FHD (1920×1080).',
        'Hardware safety safeguards: Enforces 8192px maximum bounds and 16.7M pixel area protection against memory crashes.',
      ],
      ctaText: 'Open Image Resizer',
      href: '/resizer/',
      icon: <Maximize2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      accentColor: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    },
    convert: {
      title: 'Convert Between JPG, PNG & WebP',
      tagline: 'Transcode formats for modern browser delivery or format-strict submission requirements.',
      bullets: [
        'Modern WebP transcoding: Slash image payload size by 30% to 80% while retaining full alpha transparency.',
        'Alpha channel flattening: Configure clean matte background fills (White, Black, Slate, or custom Hex) when converting transparent PNGs to solid JPEG.',
        'Client-side privacy: Zero server uploads, metadata sanitization, and instant lossless or lossy re-encoding.',
      ],
      ctaText: 'Open Image Converter',
      href: '/converter/',
      icon: <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      accentColor: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    },
  };

  const featuredTools = [
    {
      title: 'Free Image Compressor',
      description: 'Compress JPG, PNG, and WebP images to exact target file sizes (20KB, 50KB, 100KB) with strict mathematical size guarantees.',
      href: '/compressor/',
      icon: <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: 'Target-KB Engine',
      accent: 'border-blue-200 dark:border-blue-900/60 hover:border-blue-400',
      specs: 'JPG • PNG • WebP | Up to 8192px | Exact $\\le$ KB Ceiling',
    },
    {
      title: 'Online Image Resizer',
      description: 'Scale pixel dimensions with strict aspect-ratio locks, quick social presets, and browser hardware safety limits up to 8192px.',
      href: '/resizer/',
      icon: <Maximize2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Aspect Lock',
      accent: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400',
      specs: 'Proportional Locks | Presets (FHD, HD, Avatar) | Custom PX',
    },
    {
      title: 'Image Format Converter',
      description: 'Transcode between JPEG, PNG, and WebP with configurable alpha-channel flattening and custom background color fill.',
      href: '/converter/',
      icon: <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Alpha Flattening',
      accent: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-400',
      specs: 'PNG $\\leftrightarrow$ JPG $\\leftrightarrow$ WebP | Matte Fills | Quality Sliders',
    },
  ];

  const explainerData = {
    high: {
      label: 'High Fidelity (90% Quality)',
      fileSize: '142 KB (Original: 620 KB)',
      reduction: '77% reduction',
      clarity: 'Indistinguishable from uncompressed raw image. Recommended for high-DPI retina displays and photography portfolios.',
      badge: 'Best for Portfolios',
    },
    balanced: {
      label: 'Balanced (80% Quality)',
      fileSize: '48 KB (Original: 620 KB)',
      reduction: '92% reduction',
      clarity: 'Optimal balance of crisp edge fidelity and small network payload. Recommended for standard websites and web apps.',
      badge: 'Recommended for Web',
    },
    compact: {
      label: 'Ultra Compact (45% Quality)',
      fileSize: '19 KB (Original: 620 KB)',
      reduction: '97% reduction',
      clarity: 'Aggressive file reduction for strict 20KB portal limits, mobile thumbnails, and ultra-fast loading speed.',
      badge: 'Strict Portal Limits',
    },
  };

  return (
    <>
      {/* Inject Structured Data for Search & AI Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="space-y-16 sm:space-y-24 py-4 sm:py-6">
        {/* ================================================================= */}
        {/* 1. HERO SECTION                                                   */}
        {/* ================================================================= */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>100% Client-Side • HTML5 Canvas Engine • Zero Cloud Uploads</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
            Free Online Image Compressor,{' '}
            <span className="text-blue-600 dark:text-blue-400">Resizer & Converter</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            PhotoKit is a private browser utility for compressing images to strict KB ceilings, resizing dimensions with aspect-ratio locks, and transcoding between JPG, PNG, and WebP—all on your device.
          </p>

          {/* Quick Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Files Never Leave Your Device</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>EXIF & Metadata Sanitized</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Zero Server Latency & Unlimited Runs</span>
            </div>
          </div>

          {/* Integrated Upload Area / Active Handoff Router */}
          <div className="pt-2 max-w-3xl mx-auto">
            {selectedFile ? (
              <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/50 p-6 dark:border-blue-500/80 dark:bg-blue-950/20 space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Loaded: {selectedFile.name} ({formatBytes(selectedFile.size)})</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Select a tool below to process this image immediately:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href="/compressor/"
                    onClick={() => handleStageAndNavigate('/compressor/')}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Compress to Target KB</span>
                  </Link>
                  <Link
                    href="/resizer/"
                    onClick={() => handleStageAndNavigate('/resizer/')}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Resize Dimensions</span>
                  </Link>
                  <Link
                    href="/converter/"
                    onClick={() => handleStageAndNavigate('/converter/')}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Convert Format</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      clearStagedFile();
                    }}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <DropZone onFileSelect={handleHomepageFileSelect} />
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. INTERACTIVE SMART TOOL SELECTOR                                */}
        {/* ================================================================= */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              What Do You Want to Do With Your Image?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select an action to see verified technical specifications and direct workflow steps.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedToolTab('compress')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all ${
                selectedToolTab === 'compress'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Compress</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedToolTab('resize')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all ${
                selectedToolTab === 'resize'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>Resize</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedToolTab('convert')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all ${
                selectedToolTab === 'convert'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Convert</span>
            </button>
          </div>

          {/* Active Tool Dynamic Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                {smartToolContent[selectedToolTab].icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {smartToolContent[selectedToolTab].title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {smartToolContent[selectedToolTab].tagline}
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              {smartToolContent[selectedToolTab].bullets.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                href={smartToolContent[selectedToolTab].href}
                onClick={() => handleStageAndNavigate(smartToolContent[selectedToolTab].href)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs"
              >
                <span>{smartToolContent[selectedToolTab].ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. FEATURED IMAGE TOOLS                                           */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Explore PhotoKit's Browser-Native Image Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Engineered with strict invariant checks and hardware memory protection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <Card
                key={tool.title}
                className={`flex flex-col justify-between transition-all duration-200 hover:shadow-md ${tool.accent}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 shadow-xs">
                      {tool.icon}
                    </div>
                    <Badge variant="outline" size="sm">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold">{tool.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed pt-1.5 text-slate-500 dark:text-slate-400">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 mt-auto space-y-3">
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                    {tool.specs}
                  </div>
                  <Link
                    href={tool.href}
                    onClick={() => handleStageAndNavigate(tool.href)}
                    className="inline-flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 group select-none shadow-xs"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. INTERACTIVE IMAGE OPTIMIZATION EXPLAINER                       */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>How Image Compression Affects File Size vs Visual Quality</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore illustrative compression tiers below to understand the tradeoff between network transfer speed and image clarity.
            </p>
          </div>

          {/* Interactive Tier Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['high', 'balanced', 'compact'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setExplainerQuality(tier)}
                className={`text-left rounded-xl border p-3.5 transition-all ${
                  explainerQuality === tier
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>{explainerData[tier].label}</span>
                </div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {explainerData[tier].reduction}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {explainerData[tier].fileSize}
                </div>
              </button>
            ))}
          </div>

          {/* Explainer Result Insight Box */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Inspection Verdict: {explainerData[explainerQuality].label}
              </span>
              <Badge variant="outline" size="sm">
                {explainerData[explainerQuality].badge}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {explainerData[explainerQuality].clarity}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-1">
              * Note: Sample metrics are illustrative. Actual compression ratios depend on image complexity, original color variance, and chosen output format.
            </p>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. WHY CHOOSE PHOTOKIT?                                           */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Why Digital Creators & Developers Choose PhotoKit
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Engineered with zero third-party telemetry, no cloud relays, and mathematical accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                100% In-Browser Privacy
              </h3>
              <p>
                Unlike traditional online converters that upload your images to third-party cloud servers, PhotoKit processes all pixels inside your browser's local sandbox. Your photos never leave your device.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Mathematical Size Ceilings
              </h3>
              <p>
                Our 7-step binary bisection algorithm iteratively converges on the highest quality factor while guaranteeing the output byte count never exceeds your selected target KB limit.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Device Memory Protection
              </h3>
              <p>
                Active canvas surface-area safeguards protect mobile and desktop browsers against memory overflow crashes when handling ultra-high-resolution images up to 8192px.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 6. HOW PHOTOKIT WORKS (3 Steps)                                   */}
        {/* ================================================================= */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              How PhotoKit Works: 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Optimize any image in seconds without waiting for cloud queues.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-center space-y-3">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm dark:bg-blue-900 dark:text-blue-200">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                1. Select or Drop Image
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose any JPG, PNG, or WebP file. PhotoKit validates magic header bytes and dimensions in real time.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-center space-y-3">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm dark:bg-emerald-900 dark:text-emerald-200">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                2. Set Target Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pick your target KB size, set width/height dimensions with aspect-ratio locks, or pick your transcode format.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-center space-y-3">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm dark:bg-purple-900 dark:text-purple-200">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                3. Download Instantly
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare original vs processed results in the side-by-side viewer and download your optimized image directly to disk.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 7. IMAGE OPTIMIZATION KNOWLEDGE CENTER                            */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Image Optimization Knowledge Base</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear, practical answers for developers, designers, and site owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                How to Compress Images Without Losing Visible Quality
              </h3>
              <p className="leading-relaxed">
                Human vision cannot easily distinguish between raw 100% quality and 80%–85% JPEG/WebP quality on standard displays. Compressing at an 80% quality factor frequently reduces file size by 70% to 90% while keeping edge sharpness and color gradients perceptually identical.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                How to Hit Strict 20KB, 50KB & 100KB Upload Ceilings
              </h3>
              <p className="leading-relaxed">
                Government, academic, and job application portals frequently impose strict 50KB or 20KB upload limits. PhotoKit solves this by testing intermediate candidate files across a 7-step bisection curve until it finds the highest quality candidate strictly within the byte limit.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                JPG vs PNG vs WebP: Which Format Should You Use?
              </h3>
              <p className="leading-relaxed">
                Use <strong>WebP</strong> for websites: it provides superior compression and supports alpha transparency. Use <strong>PNG</strong> when lossless icon/diagram sharpness is paramount. Use <strong>JPEG</strong> when submitting to legacy systems that do not accept modern WebP files.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                How Image Optimization Improves Core Web Vitals (LCP)
              </h3>
              <p className="leading-relaxed">
                Images represent over 60% of average website payload. Reducing hero image sizes from 1MB+ down to 50KB directly improves Largest Contentful Paint (LCP) metrics, decreases mobile bandwidth consumption, and prevents layout shifts.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 8. INTERACTIVE FAQ (AEO & Answer-Engine Optimized)                */}
        {/* ================================================================= */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Frequently Asked Questions About PhotoKit</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Direct, self-contained answers reflecting verified tool functionality.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
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

        {/* ================================================================= */}
        {/* 9. CLOSING CALL TO ACTION                                         */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-8 sm:p-12 dark:border-blue-900/60 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-950 text-center space-y-4 max-w-4xl mx-auto shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm mb-1">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Start Optimizing Images Locally Today
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Fast, free, and private image processing running directly on your computer or phone. No registration or server queue required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/compressor/"
              onClick={() => handleStageAndNavigate('/compressor/')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Compress Image</span>
            </Link>
            <Link
              href="/resizer/"
              onClick={() => handleStageAndNavigate('/resizer/')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Resize Dimensions</span>
            </Link>
            <Link
              href="/converter/"
              onClick={() => handleStageAndNavigate('/converter/')}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-purple-700 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Convert Format</span>
            </Link>
          </div>
        </section>
      </Container>
    </>
  );
}
