import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Resizer',
  description:
    'Resize JPG, PNG, and WebP image dimensions up to 8192px with strict aspect-ratio locks and quick resolution presets. 100% private local processing.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/resizer/',
  },
  openGraph: {
    title: 'Image Resizer | PhotoKit',
    description:
      'Scale image dimensions with proportional aspect ratio locks and resolution presets directly in your browser.',
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
