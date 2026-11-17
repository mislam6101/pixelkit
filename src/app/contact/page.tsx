'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import {
  Mail,
  Phone,
  ArrowLeft,
  MessageSquare,
  Clock,
  Shield,
  HelpCircle,
} from 'lucide-react';

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24M7.86 18.5v-8.37H5.07v8.37h2.79z" />
    </svg>
  );
}

export default function ContactPage() {
  const contactMethods = [
    {
      title: 'Email Us',
      description:
        'For technical support, bug reports, feature suggestions, or general inquiries.',
      value: 'm.islam6101@gmail.com',
      href: 'mailto:m.islam6101@gmail.com',
      icon: <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      actionText: 'Send an email',
      isExternal: false,
    },
    {
      title: 'Phone',
      description:
        'Direct phone line for urgent technical matters or professional queries.',
      value: '+8801959186101',
      href: 'tel:+8801959186101',
      icon: <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      actionText: 'Call now',
      isExternal: false,
    },
    {
      title: 'LinkedIn',
      description:
        'Connect directly with the developer on LinkedIn for professional networking.',
      value: 'Md. Mahmudul Islam',
      href: 'https://www.linkedin.com/in/md-mahmudul-islam-a8bb41306/',
      icon: <LinkedInIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      actionText: 'View profile',
      isExternal: true,
    },
  ];

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
          <MessageSquare className="w-4 h-4" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Contact Us
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Have questions about PhotoKit, encountered an issue with image processing, or want to suggest a new capability? We welcome your feedback, inquiries, and bug reports.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method) => (
          <div
            key={method.title}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                {method.icon}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {method.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {method.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block break-all">
                {method.value}
              </span>
              <a
                href={method.href}
                target={method.isExternal ? '_blank' : undefined}
                rel={method.isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                {method.actionText} &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Response Time</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              As PhotoKit is maintained by an independent developer, inquiries are reviewed on a best-effort basis, usually within a few business days. For immediate technical questions regarding specific tools, please consult our FAQ sections.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Communication Privacy</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your contact details and message contents are handled in strict confidence by the developer. PhotoKit does not sell, lease, or share personal contact details with third-party marketers.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Frequently Asked Inquiries</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>
              <strong>Bug reports:</strong> Please specify your browser family, operating system, image format, and approximate image dimensions to help reproduce the issue.
            </li>
            <li>
              <strong>Feature requests:</strong> Suggestions for additional dimension presets, format compatibility, or algorithmic refinements are always welcome.
            </li>
            <li>
              <strong>Commercial usage:</strong> PhotoKit is free to use for both personal and commercial image optimization workflows.
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
