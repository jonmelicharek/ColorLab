import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ColorLab AI — Smart Hair Color Formulas for Stylists',
  description: 'Upload a client photo and inspiration image. AI analyzes both and delivers a complete color formula, technique guide, and product list in seconds.',
  keywords: ['hair color formula', 'hair stylist tool', 'balayage formula', 'hair color app', 'salon technology'],
  openGraph: {
    title: 'ColorLab AI — Smart Hair Color Formulas',
    description: 'The AI-powered formula engine for professional hair colorists.',
    type: 'website',
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ColorLab AI',
    description: 'AI-powered hair color formulas for professional stylists.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-pearl text-ink grain-overlay">
        {children}
      </body>
    </html>
  );
}
