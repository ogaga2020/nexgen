'use client';

import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

export default function AdminNavbar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await axios.post('/api/admin/logout');
        router.push('/admin');
    };

    const link = (href: string, label: string) => (
        <button
            onClick={() => router.push(href)}
            className={`px-3 py-2 rounded-md transition font-medium ${pathname.startsWith(href)
                ? 'bg-white text-[var(--primary)]'
                : 'text-white hover:bg-[rgba(255,255,255,0.15)]'
                }`}
        >
            {label}
        </button>
    );

    return (
        <nav className="bg-[var(--primary)] text-white px-4 md:px-6 py-3 flex flex-wrap gap-2 justify-between items-center">
            <h1 className="font-bold text-lg">NexGen Admin</h1>
            <div className="flex flex-wrap items-center gap-2">
                {link('/admin/dashboard', 'Dashboard')}
                {link('/admin/students', 'Students')}
                {link('/admin/media', 'Media')}
                {link('/admin/create', 'Create Admin')}
                {link('/admin/transaction', 'Transaction')}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md font-medium transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
