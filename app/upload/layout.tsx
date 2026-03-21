import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analyze Hair — ColorLab AI',
  description: 'Upload your client photo and inspiration image for instant color formula analysis.',
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
