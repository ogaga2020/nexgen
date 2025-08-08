import AdminNavbar from '@/components/AdminNavbar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    try {
        if (!token) throw new Error('no token');
        jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
        redirect('/admin');
    }

    return (
        <>
            <AdminNavbar />
            <main className="p-4">{children}</main>
        </>
    );
}
