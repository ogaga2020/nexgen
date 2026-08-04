export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import { Inter, Open_Sans } from 'next/font/google';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotifierProvider from '@/components/Notifier';
import WhatsApp from '@/components/Whatsapp';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ variable: '--font-ui', subsets: ['latin'], display: 'swap' });
const openSans = Open_Sans({ variable: '--font-body', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: { default: 'PowerTrust Energy Limited', template: '%s | PowerTrust Energy Limited' },
  description: 'Reliable electrical, solar and plumbing solutions, plus practical technical training in Delta State, Nigeria.',
  keywords: ['PowerTrust Energy Limited', 'solar installation Nigeria', 'electrical services Delta State', 'plumbing services', 'technical training'],
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    title: 'PowerTrust Energy Limited',
    description: 'Powering homes, businesses and careers through dependable technical solutions.',
    images: ['/powertrust-hero.png'],
    type: 'website',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${openSans.variable}`}>
      <body>
        <Navbar />
        <NotifierProvider>
          {children}
          <WhatsApp />
        </NotifierProvider>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
