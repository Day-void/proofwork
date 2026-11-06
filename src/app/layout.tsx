import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ProofWork — Make your work count',
    template: '%s | ProofWork',
  },
  description:
    'Turn real projects into trusted proof of what you can do. Get thoughtful human assessment, backed by AI and grounded in your actual work.',
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
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
