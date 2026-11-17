'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import {
  FileText,
  ServerOff,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Scale,
  ExternalLink,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function TermsPage() {
  return (
    <Container className="max-w-4xl space-y-10 py-4 sm:py-8">
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
          <FileText className="w-4 h-4" />
          <span>Terms & Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Terms of Use
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Last updated: November 2026. Please read these Terms of Use carefully before using PhotoKit. By accessing or using the website, you agree to be bound by these terms.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing, browsing, or utilizing the web applications available at{' '}
            <strong className="text-slate-900 dark:text-slate-100">PhotoKit</strong> (
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">https://photokit-app.pages.dev/</code>), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Use and our{' '}
            <Link
              href="/privacy-policy/"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Privacy Policy
            </Link>
            . If you do not agree with any part of these terms, you must discontinue using the service immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ServerOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>2. Nature of the Service</span>
          </h2>
          <p>
            PhotoKit provides browser-native digital image manipulation utilities, including an{' '}
            <Link href="/compressor/" className="text-blue-600 dark:text-blue-400 hover:underline">Image Compressor</Link>,{' '}
            <Link href="/resizer/" className="text-blue-600 dark:text-blue-400 hover:underline">Image Resizer</Link>, and{' '}
            <Link href="/converter/" className="text-blue-600 dark:text-blue-400 hover:underline">Image Converter</Link>.
          </p>
          <p>
            All image decoding, manipulation, resizing, compression, and encoding processes occur solely within your device&apos;s local web browser environment via standard HTML5 Canvas and Web APIs. PhotoKit operates with <strong>zero server uploads</strong>; your images are never transferred to, inspected by, or stored on remote servers.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>3. Acceptable Use and User Responsibility</span>
          </h2>
          <p>
            As a user of PhotoKit, you agree to comply with all applicable local, national, and international laws and regulations. You are solely responsible for all images you load into the application and process on your device.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>You affirm that you have all necessary rights, licenses, and permissions to access, process, and modify any images you submit to the application.</li>
            <li>You agree not to attempt to reverse engineer, decompile, disable, or disrupt the operation of PhotoKit, or bypass any built-in safeguards.</li>
            <li>You agree not to utilize PhotoKit to process or generate illicit, defamatory, infringent, or otherwise unlawful material.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>4. Intellectual Property & File Ownership</span>
          </h2>
          <p>
            <strong>Your Content Remains Yours:</strong> PhotoKit claims absolutely no intellectual property rights, copyright ownership, or commercial licensing over any files, photos, or graphics you process. Because files are never transmitted to our infrastructure, you retain 100% exclusive ownership of your uploaded and exported images at all times.
          </p>
          <p>
            <strong>PhotoKit Intellectual Property:</strong> The website design, source code, visual components, branding, algorithms, and documentation are the property of the developer and are protected by applicable copyright and intellectual property laws.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>5. Hardware & Device Processing Limitations</span>
          </h2>
          <p>
            Because all image rendering takes place locally on your client machine, performance depends directly on your device&apos;s available system RAM, CPU speed, and GPU hardware acceleration.
          </p>
          <p>
            To prevent browser crashes, out-of-memory errors, and thread freezing on resource-constrained devices, PhotoKit enforces built-in safety boundaries:
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 text-xs space-y-2">
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Maximum Dimension:</strong> 8,192 pixels along any single edge.</li>
              <li><strong>Maximum Pixel Area:</strong> 16,777,216 total pixels (16.7 megapixels).</li>
              <li><strong>Iterative Safety Limits:</strong> Binary searches are bounded to 7 iterations with maximum 5 downscaling passes.</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Images exceeding these specifications will be safely rejected or scaled to maintain browser stability.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>6. Disclaimer of Warranties & Limitation of Liability</span>
          </h2>
          <p>
            PhotoKit is provided on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or error-free operation.
          </p>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 space-y-1.5">
            <p className="font-semibold">User Backup Obligation & Liability Limitation:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>You are solely responsible for keeping backup copies of all original image files prior to processing them.</li>
              <li>Under no circumstances shall PhotoKit or its developer be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including data loss, hardware instability, or business interruption arising from the use or inability to use the application.</li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>7. Third-Party Services & Advertising</span>
          </h2>
          <p>
            PhotoKit uses Cloudflare Pages for secure static asset delivery, and optional, consent-dependent Google Analytics 4 for aggregate technical telemetry.
          </p>
          <p>
            In the future, PhotoKit may display third-party advertisements, including ads served by Google AdSense and its advertising partners. Third-party advertisers may utilize cookies, web beacons, or device identifiers to serve personalized or non-personalized advertisements based on your prior visits to this and other websites. Your interactions with third-party advertising services are governed by the respective privacy policies and terms of those providers. For complete details, refer to our{' '}
            <Link href="/privacy-policy/" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            8. Modifications to Terms
          </h2>
          <p>
            We reserve the right to revise or replace these Terms of Use at any time. Changes will be effective immediately upon publication of the updated terms on this page. Your continued use of PhotoKit following any modifications constitutes acceptance of the new terms.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            9. Contact Information
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            If you have any questions or inquiries regarding these Terms of Use, please contact the developer:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <a
              href="mailto:m.islam6101@gmail.com"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">m.islam6101@gmail.com</span>
            </a>
            <a
              href="tel:+8801959186101"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>+880 1959-186101</span>
            </a>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For further communication options and developer profiles, visit our{' '}
            <Link href="/contact/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Contact Page
            </Link>.
          </p>
        </section>
      </div>
    </Container>
  );
}
