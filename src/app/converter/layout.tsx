import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Converter',
  description:
    'Convert between JPEG, PNG, and WebP formats instantly with alpha-channel matte controls and zero cloud uploads. 100% private in-browser transcoding.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/converter/',
  },
  openGraph: {
    title: 'Image Converter | PhotoKit',
    description:
      'Convert JPG, PNG, and WebP formats directly in your browser with transparent alpha channel support.',
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
