import '@/styles/admin.css';
import '@/styles/globals.css';
import type { Metadata } from "next";
import NotifierProvider from '@/components/Notifier';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    title: "NexGen Admin",
    description: "Admin Maintenace and database management",
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
