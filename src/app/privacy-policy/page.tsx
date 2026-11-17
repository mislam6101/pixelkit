'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { openPrivacySettings } from '@/components/analytics/PrivacySettingsModal';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  ServerOff,
  Cookie,
  AlertTriangle,
  ArrowLeft,
  Settings2,
  ExternalLink,
  Radio,
  Mail,
  Phone,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy & Data Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Last updated: November 2026. This policy describes how PhotoKit operates as a browser-native image utility, what data is processed locally, and how optional analytics telemetry and advertising policies are managed.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ServerOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>1. 100% Client-Side Local Image Processing</span>
          </h2>
          <p>
            PhotoKit is architected from the ground up as a purely client-side browser application. When you select or drop an image into any PhotoKit tool (Compressor, Resizer, Converter), the file is read, inspected, and processed entirely within your device’s local browser memory using standard <strong>HTML5 Canvas</strong> and <strong>Web APIs</strong>.
          </p>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            Your images, pixel bitmaps, file blobs, and EXIF metadata are never uploaded to any remote server or cloud infrastructure operated by PhotoKit. When you close or refresh your browser tab, all temporary memory references are automatically cleared.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>2. What PhotoKit Deliberately Does NOT Collect</span>
          </h2>
          <p>
            To uphold the principle of strict data minimization, PhotoKit’s code intentionally excludes all of the following from analytics telemetry:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>No image content or pixels:</strong> We cannot see, view, or reconstruct your photos.</li>
            <li><strong>No filenames or file paths:</strong> Neither original filenames (e.g., <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">id_card.png</code>) nor output filenames are ever transmitted.</li>
            <li><strong>No file sizes or image dimensions:</strong> Exact pixel dimensions, aspect ratios, file byte counts, and compression percentages are never collected.</li>
            <li><strong>No EXIF metadata:</strong> Camera models, GPS location coordinates, and timestamps are not extracted or sent.</li>
            <li><strong>No URL parameters or query strings:</strong> All search parameters and URL fragments are stripped before page location telemetry is recorded.</li>
            <li><strong>No personal accounts or forms:</strong> PhotoKit requires no account, email address, password, or login credentials.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>3. Optional Google Analytics 4 (GA4) Telemetry</span>
          </h2>
          <p>
            With your explicit permission, PhotoKit uses Google Analytics 4 (Measurement ID: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">G-DH98V1E896</code>) to understand aggregate operational performance and popular feature usage.
          </p>
          <p>
            When enabled, PhotoKit transmits only five predefined, non-identifying operational parameters:
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 text-xs space-y-2">
            <p><strong>Permitted Operational Parameters:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li><code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">tool_name</code>: compressor, resizer, converter, homepage</li>
              <li><code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">action_type</code>: predefined action category (e.g. process_start, file_download)</li>
              <li><code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">mode</code>: predefined tool mode (e.g. target_kb, quality)</li>
              <li><code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">preset</code>: predefined option (e.g. preset_50kb, preset_fhd)</li>
              <li><code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">error_code</code>: standardized application error code (e.g. target_unreachable)</li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong>Third-Party Processing:</strong> Google Analytics operates under Google’s privacy policies. Google may collect technical device information (such as operating system, browser family, viewport resolution, and approximate geographical region derived from IP address). We do not use Google Signals or ad personalization features in Google Analytics.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>4. Consent Storage & How to Withdraw Consent</span>
          </h2>
          <p>
            Analytics is <strong>disabled by default</strong> for all visitors. The Google Analytics script is not loaded and no tracking cookies are set unless you explicitly click <em>&ldquo;Accept Analytics&rdquo;</em> on the consent banner.
          </p>
          <p>
            Your choice is saved in your browser&apos;s local storage under the key <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">photokit-consent</code>. You can change or withdraw your consent at any time using the Privacy Settings control:
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={openPrivacySettings}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Settings2 className="w-4 h-4" />
              <span>Open Privacy Settings</span>
            </button>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>5. Technical Limitations of Consent Withdrawal</span>
          </h2>
          <p>
            When you withdraw consent:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>PhotoKit immediately halts all future analytics event dispatches.</li>
            <li>The Google Analytics script tag is removed from the active webpage DOM.</li>
            <li>The application attempts to clear client-accessible cookies (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">_ga</code>, <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">_ga_*</code>).</li>
          </ul>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 space-y-1.5">
            <p className="font-semibold">Honest Technical Disclosures:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>Withdrawing consent cannot recall, cancel, or retroactively delete HTTP network requests that have already been transmitted to Google Analytics prior to your withdrawal.</li>
              <li>Browser security policies restrict JavaScript from deleting cookies that carry the <code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded">HttpOnly</code> flag or cookies set across differing domain/path scopes.</li>
              <li>We do not claim absolute anonymity. While PhotoKit minimizes data aggressively and processes files 100% locally, external internet network requests inherently transmit standard IP addresses to network intermediaries.</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>6. Third-Party Advertising and Cookies (Google AdSense Preparation)</span>
          </h2>
          <p>
            To keep PhotoKit completely free without charging subscriptions or fees, PhotoKit may display advertisements served by third-party advertising partners, including <strong>Google AdSense</strong>.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 text-xs space-y-2.5">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Required Google Advertising Disclosures:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>
                <strong>Third-party vendor cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites on the internet.
              </li>
              <li>
                <strong>Advertising cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visits to PhotoKit and/or other sites across the World Wide Web.
              </li>
              <li>
                <strong>Opting out of personalized advertising:</strong> Users may opt out of personalized advertising at any time by visiting{' '}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Google Ads Settings
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
                .
              </li>
              <li>
                Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting the{' '}
                <a
                  href="https://www.aboutads.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  www.aboutads.info
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>{' '}
                consumer choice page.
              </li>
              <li>
                For further information on how Google manages advertising data and cookies, visit{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  How Google uses information from sites or apps that use our services
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
                .
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
            <p className="font-semibold">Implementation Status Notice:</p>
            <p className="mt-1 leading-relaxed">
              These advertising disclosures are provided in preparation for third-party advertising integration. PhotoKit does not currently display third-party advertisements or execute advertising tracking scripts on this website. When advertising services are activated in the future, all ad serving and cookie operations will strictly adhere to the terms described above.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            7. Changes and Publisher Contact Information
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            As web standards, browser security APIs, and privacy regulations evolve, this Privacy Policy will be updated accordingly. Material updates will be published directly on this page with a revised date.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Publisher & Data Privacy Contact:
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              For any questions, clarifications, or privacy-related requests regarding PhotoKit, contact the publisher directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a
                href="mailto:m.islam6101@gmail.com"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">m.islam6101@gmail.com</span>
              </a>
              <a
                href="tel:+8801959186101"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>+880 1959-186101</span>
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-800 text-slate-500">
              <span>Developer: <strong>Md. Mahmudul Islam</strong></span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/md-mahmudul-islam-a8bb41306/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <Link
                  href="/contact/"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Contact Page
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}
