import './globals.css';
import type { Metadata } from 'next';
import { Inter as NextInter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StorageProvider } from '@/contexts/storage-context';

const inter = NextInter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlvckWall AI',
  description: 'The next generation AI platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <TooltipProvider>
          <StorageProvider>
            {children}
            <Toaster />
          </StorageProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}