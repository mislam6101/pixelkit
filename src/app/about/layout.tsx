import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about PhotoKit, a free, browser-native image optimization studio engineered for private, client-side compression, resizing, and format conversion.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/about/',
  },
  openGraph: {
    title: 'About Us | PhotoKit',
    description:
      'Learn about PhotoKit, a free, browser-native image utility built for private, fast image processing.',
    url: 'https://photokit-app.pages.dev/about/',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
