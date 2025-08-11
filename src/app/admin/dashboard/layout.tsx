import AdminNavbar from '@/components/AdminNavbar';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const me = await getCurrentAdmin();
    if (!me) redirect('/admin');

    return (
        <>
            <AdminNavbar />
            <main className="p-4">{children}</main>
        </>
    );
}
