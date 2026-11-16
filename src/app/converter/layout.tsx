import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Converter',
  description:
    'Convert between JPEG, PNG, and WebP formats with custom background matte fills and quality controls. Images are processed locally in your browser and are not uploaded to our servers.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/converter/',
  },
  openGraph: {
    title: 'Image Converter | PhotoKit',
    description:
      'Convert JPG, PNG, and WebP formats directly in your browser with transparency handling and custom JPEG background colors. Images are processed locally in your browser and are not uploaded to our servers.',
    url: 'https://photokit-app.pages.dev/converter/',
  },
};

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
