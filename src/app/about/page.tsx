'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import {
  Sparkles,
  ServerOff,
  Cpu,
  ShieldCheck,
  SlidersHorizontal,
  Maximize2,
  RefreshCw,
  ArrowLeft,
  User,
  HeartHandshake,
} from 'lucide-react';

export default function AboutPage() {
  const tools = [
    {
      title: 'Image Compressor',
      href: '/compressor/',
      icon: <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      description:
        'Compresses JPG and WebP photos to exact target kilobyte thresholds (such as 20KB, 50KB, or 100KB) using a bounded 7-step binary bisection algorithm, or adjusts visual quality on a 1%–100% slider.',
    },
    {
      title: 'Image Resizer',
      href: '/resizer/',
      icon: <Maximize2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      description:
        'Scales image dimensions proportionally up to 8192px using aspect-ratio locks or quick resolution presets (Full HD, HD, Web, Square, Avatar) backed by bounding-box fitting logic.',
    },
    {
      title: 'Image Converter',
      href: '/converter/',
      icon: <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      description:
        'Transcodes bidirectionally between JPEG, PNG, and WebP formats, featuring custom background matte fills to prevent black background artifacts when converting transparent alpha graphics to JPEG.',
    },
  ];

  return (
    <Container className="max-w-4xl space-y-12 py-4 sm:py-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to PhotoKit</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles className="w-4 h-4" />
          <span>About PhotoKit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Private, Browser-Native Image Optimization
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          PhotoKit is a free web-based image manipulation studio engineered to compress, resize, and convert images directly inside your web browser with zero server uploads.
        </p>
      </div>

      {/* Mission & Purpose */}
      <section className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Our Mission & Purpose</span>
        </h2>
        <p>
          Digital creators, web developers, students, and professionals frequently encounter strict file size caps when uploading resumes, visa documents, admission paperwork, or publishing web assets. Most existing online tools require users to upload their personal photos to third-party servers, where files are stored, processed, and potentially retained.
        </p>
        <p>
          PhotoKit was created to eliminate this privacy compromise. We believe image optimization should be fast, private, and accessible to everyone without mandatory account signups, subscriptions, watermarks, or hidden limits.
        </p>
      </section>

      {/* Architecture Section */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/40 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
          <ServerOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>How Client-Side Image Processing Works</span>
        </div>
        <p>
          Unlike conventional cloud-based converters, PhotoKit operates on a <strong>100% client-side architecture</strong> using standard <strong>HTML5 Canvas</strong>, <strong>Web APIs</strong>, and modern JavaScript engines:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">1. Local Decoding</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              When you select a file, your browser decodes image headers and pixel data directly into device memory.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">2. In-Memory Canvas</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Transformations (scaling, quality bisection, format encoding) execute entirely on your computer or phone hardware.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">3. Zero Server Uploads</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your image files, bitmaps, and EXIF metadata never leave your device. When you close the tab, all memory references clear.
            </p>
          </div>
        </div>
      </section>

      {/* Core Tools Overview */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>The PhotoKit Toolset</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered with strict algorithmic guarantees and hardware guardrails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  {tool.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={tool.href}
                  className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  Open {tool.title} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Developer & Contact Section */}
      <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>About the Developer & Support</span>
        </h2>
        <p>
          PhotoKit is engineered and maintained by <strong>Md. Mahmudul Islam</strong> as an independent web development project. Built with Next.js, React, TypeScript, and Tailwind CSS, the application is deployed on Cloudflare Pages to deliver global low-latency static content delivery.
        </p>
        <p>
          We are committed to transparent development, user privacy, and continuous improvement. If you have questions, feedback, or would like to report a bug, please visit our{' '}
          <Link href="/contact/" className="text-blue-600 dark:text-blue-400 underline font-medium">
            Contact page
          </Link>{' '}
          or reach out directly via email at{' '}
          <a href="mailto:m.islam6101@gmail.com" className="text-blue-600 dark:text-blue-400 underline font-medium">
            m.islam6101@gmail.com
          </a>.
        </p>
      </section>
    </Container>
  );
}
