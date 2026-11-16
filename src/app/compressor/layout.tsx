import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Compressor',
  description:
    'Compress JPG and WebP images to exact target file sizes (20KB, 50KB, 100KB) or custom quality in your browser. 100% private client-side compression.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/compressor/',
  },
  openGraph: {
    title: 'Image Compressor | PhotoKit',
    description:
      'Compress JPG and WebP images to exact target file sizes or custom quality directly in your browser. 100% private, zero uploads.',
    url: 'https://photokit-app.pages.dev/compressor/',
  },
};

export default function CompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
