import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotifierProvider from '@/components/Notifier';


const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexGen Flow and Power",
  description: "Training and services in Electrical, Plumbing, and Solar",
};

export default function PublicLayout({ children, }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${openSans.variable}`}>
      <body className="font-ui bg-background text-foreground">
        <Navbar />
        <NotifierProvider>{children}</NotifierProvider>
        <Footer />
      </body>
    </html>
  );
}
