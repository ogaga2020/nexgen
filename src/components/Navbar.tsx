'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Training', href: '/training' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Register', href: '/register' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [pathname]);

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/');

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-md">
            <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-blue-900">
                    NexGen
                </Link>

                <button
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        {open ? (
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                <div className="hidden md:flex items-center gap-6 text-sm md:text-base">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`transition hover:text-blue-800 ${isActive(link.href) ? 'text-blue-800 font-semibold' : 'text-gray-700'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className={`md:hidden border-t ${open ? 'block' : 'hidden'}`}>
                <div className="px-6 py-3 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block rounded px-2 py-2 transition ${isActive(link.href)
                                ? 'bg-blue-50 text-blue-800 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
