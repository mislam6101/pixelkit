import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout';
import { StagedImageProvider } from '@/context/StagedImageContext';

export const metadata: Metadata = {
  title: {
    default: 'PixelKit — Browser-Native Image Compressor, Resizer & Converter',
    template: '%s | PixelKit',
  },
  description:
    'High-performance, private image processing studio running 100% in your browser. Compress images to exact KB targets, resize with aspect-ratio locks, and convert between JPEG, PNG, and WebP with zero server uploads.',
  keywords: [
    'image compressor',
    'target size compressor',
    'compress image to 50kb',
    'compress image to 20kb',
    'image resizer',
    'image converter',
    'png to webp',
    'client-side image tools',
    'browser canvas image compressor',
  ],
  authors: [{ name: 'PixelKit' }],
  creator: 'PixelKit',
  metadataBase: new URL('https://pixelkit.local'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelkit.local',
    title: 'PixelKit — Browser-Native Image Compressor, Resizer & Converter',
    description:
      'Fast, private image optimization running entirely in your browser using HTML5 Canvas. Compress to target KB, resize, and convert formats with instant downloads.',
    siteName: 'PixelKit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelKit — Browser-Native Image Tools',
    description:
      'Compress to exact KB sizes, resize, and convert formats directly in your browser. Private, fast, zero uploads.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('pixelkit-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
        <StagedImageProvider>
          <AppShell>{children}</AppShell>
        </StagedImageProvider>
      </body>
    </html>
  );
}
