import '@/styles/globals.css';
import '@/styles/admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="admin-theme">
            <body className="font-ui bg-[var(--background)] text-[var(--foreground)]">
                {children}
            </body>
        </html>
    );
}
