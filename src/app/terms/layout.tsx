import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms of Use for PhotoKit, detailing acceptable use, user responsibilities, service availability, and disclaimers.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/terms/',
  },
  openGraph: {
    title: 'Terms of Use | PhotoKit',
    description:
      'Terms of Use for PhotoKit, detailing acceptable use, user responsibilities, and service policies.',
    url: 'https://photokit-app.pages.dev/terms/',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
