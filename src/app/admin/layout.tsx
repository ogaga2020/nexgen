export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="font-ui bg-background text-foreground">
                {children}
            </body>
        </html>
    );
}
