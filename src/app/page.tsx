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
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { useStagedImage } from '@/context/StagedImageContext';

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { stageFile, clearStagedFile } = useStagedImage();

  const tools = [
    {
      title: 'Image Compressor',
      description: 'Compress JPG, PNG, and WebP images to exact target file sizes (20KB, 50KB, 100KB) with strict mathematical size guarantees.',
      href: '/compressor',
      icon: <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: 'Target-KB Engine',
      accent: 'border-blue-200 dark:border-blue-900/60 hover:border-blue-400',
    },
    {
      title: 'Image Resizer',
      description: 'Scale pixel dimensions with strict aspect-ratio locks, presets, and hardware safety limits up to 8192px.',
      href: '/resizer',
      icon: <Maximize2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Aspect Lock',
      accent: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400',
    },
    {
      title: 'Image Converter',
      description: 'Transcode between JPEG, PNG, and WebP with configurable alpha-channel flattening and background fill.',
      href: '/converter',
      icon: <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Alpha Flattening',
      accent: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-400',
    },
  ];

  const handleHomepageFileSelect = (file: File) => {
    setSelectedFile(file);
    stageFile(file);
  };

  return (
    <Container className="space-y-14 sm:space-y-20 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>100% Client-Side • HTML5 Canvas Engine • Zero Server Latency</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.15]">
          Precision image optimization,{' '}
          <span className="text-blue-600 dark:text-blue-400">completely local.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          PixelKit is an ultra-fast browser utility for compressing to strict file-size targets, resizing with aspect-ratio locks, and transcoding between JPEG, PNG, and WebP.
        </p>

        {/* Feature Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Files Never Leave Your Device</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Metadata & EXIF Sanitized</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Zero Server Costs & Unlimited Runs</span>
          </div>
        </div>
      </section>

      {/* Interactive DropZone / Action Router */}
      <section className="max-w-3xl mx-auto space-y-4">
        {selectedFile ? (
          <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/50 p-6 dark:border-blue-500/80 dark:bg-blue-950/20 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Loaded: {selectedFile.name} ({formatBytes(selectedFile.size)})</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Choose an action for this image:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/compressor"
                onClick={() => {
                  if (selectedFile) stageFile(selectedFile);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Compress to Target KB</span>
              </Link>
              <Link
                href="/resizer"
                onClick={() => {
                  if (selectedFile) stageFile(selectedFile);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Resize Dimensions</span>
              </Link>
              <Link
                href="/converter"
                onClick={() => {
                  if (selectedFile) stageFile(selectedFile);
                }}
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
      </section>

      {/* Tool Cards */}
      <section className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Available Image Tools
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Engineered with strict invariant checks and hardware safety safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
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
              <CardContent className="pt-4 mt-auto">
                <Link
                  href={tool.href}
                  onClick={() => {
                    if (selectedFile) stageFile(selectedFile);
                  }}
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

      {/* Why Client-Side Architecture Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Engineered for Complete Privacy & Zero Latency</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              No Cloud Uploads
            </h4>
            <p>
              Your images never travel over the network. All compression, resizing, and transcoding execute in isolated Web Canvas contexts inside your device.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Strict Invariant Protection
            </h4>
            <p>
              Target file sizes use a bounded 7-step bisection algorithm with strict ceiling guarantees. PixelKit never returns a file larger than your target KB.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Hardware Memory Safeguards
            </h4>
            <p>
              Safe dimension limits prevent browser crashes from multi-gigapixel files, with active memory warning indicators for high-resolution images.
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
