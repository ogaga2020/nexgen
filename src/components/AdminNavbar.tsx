'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

export default function AdminNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await axios.post('/api/admin/logout');
        router.push('/admin');
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const NavButton = ({ href, label, mobile = false }: { href: string; label: string; mobile?: boolean }) => (
        <button
            onClick={() => {
                router.push(href as any);
                setOpen(false);
            }}
            className={[
                'rounded-md font-medium transition',
                mobile ? 'w-full text-left px-3 py-3' : 'px-3 py-2',
                isActive(href) ? 'bg-white text-[var(--primary)]' : 'text-white hover:bg-[rgba(255,255,255,0.15)]'
            ].join(' ')}
        >
            {label}
        </button>
    );

    const LogoutButton = ({ mobile = false }: { mobile?: boolean }) => (
        <button
            onClick={handleLogout}
            className={[
                'rounded-md font-medium transition',
                mobile ? 'w-full text-left px-3 py-3' : 'px-3 py-2',
                'bg-red-500 hover:bg-red-600 text-white'
            ].join(' ')}
        >
            Logout
        </button>
    );

    return (
        <nav className="bg-[var(--primary)] text-white sticky top-0 z-50">
            <div className="px-4 md:px-6 py-3 flex items-center justify-between">
                <h1 className="font-bold text-lg">NexGen Admin</h1>

                <div className="hidden md:flex items-center gap-2">
                    <NavButton href="/admin/dashboard" label="Dashboard" />
                    <NavButton href="/admin/students" label="Students" />
                    <NavButton href="/admin/media" label="Media" />
                    <NavButton href="/admin/create" label="Admins" />
                    <NavButton href="/admin/transaction" label="Transaction" />
                    <LogoutButton />
                </div>

                <button
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none"
                    aria-expanded={open}
                    aria-label="Toggle navigation"
                >
                    {open ? (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            </div>

            <div className={`${open ? 'block' : 'hidden'} md:hidden border-t border-white/10`}>
                <div className="px-2 py-2 flex flex-col gap-1">
                    <NavButton mobile href="/admin/dashboard" label="Dashboard" />
                    <NavButton mobile href="/admin/students" label="Students" />
                    <NavButton mobile href="/admin/media" label="Media" />
                    <NavButton mobile href="/admin/create" label="Admins" />
                    <NavButton mobile href="/admin/transaction" label="Transaction" />
                    <LogoutButton mobile />
                </div>
            </div>
        </nav>
    );
}
