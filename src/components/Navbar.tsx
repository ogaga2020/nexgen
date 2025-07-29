'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Training', href: '/training' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Register', href: '/register' },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className= "bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50" >
        <Link href="/" className = "text-xl font-bold text-blue-900" > NexGen </Link>
            < div className = "space-x-4 text-sm md:text-base" >
            {
                navLinks.map(link => (
                    <Link
            key= { link.href }
            href = { link.href }
            className = {`hover:text-blue-800 transition ${pathname === link.href ? 'text-blue-800 font-semibold' : 'text-gray-700'
                        }`}
                >
                { link.name }
                </Link>
        ))
}
</div>
    </nav>
  );
}
