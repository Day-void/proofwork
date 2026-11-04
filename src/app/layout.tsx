import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ProofWork — Verified Skills Assessment',
    template: '%s | ProofWork',
  },
  description:
    'Bridge the gap between having skills and proving them. Submit real projects, receive AI-assisted and human-verified assessments, and share verified skill reports.',
  keywords: ['skills verification', 'assessment', 'web development', 'portfolio', 'proof of work'],
  authors: [{ name: 'ProofWork' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ProofWork',
    title: 'ProofWork — Verified Skills Assessment',
    description:
      'Submit real projects. Receive AI-assisted, human-verified assessments. Share verified skill reports.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
