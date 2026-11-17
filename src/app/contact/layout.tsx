import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the PhotoKit developer for questions, feedback, technical support, or partnership inquiries.',
  alternates: {
    canonical: 'https://photokit-app.pages.dev/contact/',
  },
  openGraph: {
    title: 'Contact Us | PhotoKit',
    description:
      'Get in touch with the PhotoKit developer for questions, feedback, or technical support.',
    url: 'https://photokit-app.pages.dev/contact/',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
