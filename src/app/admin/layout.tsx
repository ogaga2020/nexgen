import '@/styles/admin.css';
import '@/styles/globals.css';
import NotifierProvider from '@/components/Notifier';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="admin-theme">
            <body className="font-ui bg-[var(--background)] text-[var(--foreground)]">
                <NotifierProvider>{children}</NotifierProvider>
            </body>
        </html>
    );
}
