import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Transparent privacy policy detailing 100% browser-native image processing, strict data minimization, and optional Google Analytics operational telemetry.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/privacy-policy/',
  },
  openGraph: {
    title: 'Privacy Policy | PhotoKit',
    description:
      'Learn how PhotoKit processes images 100% locally in your browser memory and protects user privacy.',
    url: 'https://photokit-app.pages.dev/privacy-policy/',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
