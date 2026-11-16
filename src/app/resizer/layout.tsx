import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Resizer',
  description:
    'Resize JPG, PNG, and WebP image dimensions up to 8192px with aspect-ratio locks and resolution presets. Images are processed locally in your browser and are not uploaded to our servers.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/resizer/',
  },
  openGraph: {
    title: 'Image Resizer | PhotoKit',
    description:
      'Scale image dimensions proportionally with aspect ratio locks and resolution presets directly in your browser. Images are processed locally in your browser and are not uploaded to our servers.',
    url: 'https://photokit-app.pages.dev/resizer/',
  },
};

export default function ResizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
