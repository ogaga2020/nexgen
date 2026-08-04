'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import BrandMark from './BrandMark';
import ContactActions from './ContactActions';

const links = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Solutions', href: '/training' },
  { name: 'Projects', href: '/projects' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="site-shell flex h-[76px] items-center justify-between">
        <BrandMark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return <Link key={link.href} href={link.href as any} className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${active ? 'bg-[#071b35] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-[#071b35]'}`}>{link.name}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-2 lg:gap-3">
          <ContactActions compact />
          <Link href="/register" className="hidden rounded-full bg-[#0876d1] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(8,118,209,.22)] transition hover:-translate-y-0.5 hover:bg-[#0667b8] lg:inline-flex">Join training</Link>
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-[#071b35] text-white lg:hidden" aria-label="Toggle navigation" aria-expanded={open}>
            <span className="relative h-4 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${open ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>
      {open && <div className="border-t border-slate-100 bg-white lg:hidden"><div className="site-shell grid gap-1 py-4">{links.map((link) => <Link key={link.href} href={link.href as any} className="rounded-xl px-4 py-3 font-bold text-slate-700 hover:bg-slate-100">{link.name}</Link>)}<Link href="/register" className="mt-2 rounded-xl bg-[#0876d1] px-4 py-3 text-center font-extrabold text-white">Join training</Link></div></div>}
    </header>
  );
}
