import '@/styles/admin.css';
import '@/styles/globals.css';
import type { Metadata } from "next";
import NotifierProvider from '@/components/Notifier';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    title: "PowerTrust Operations",
    description: "PowerTrust Energy Limited administration",
    icons: { icon: '/powertrust-icon.png' },
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="admin-theme">
            <body className="font-ui bg-[var(--background)] text-[var(--foreground)]">
                <NotifierProvider>
                    {children}
                </NotifierProvider>
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
