'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { FiAward, FiBarChart2, FiCreditCard, FiExternalLink, FiImage, FiLogOut, FiMenu, FiUsers, FiUserPlus, FiX } from 'react-icons/fi';

const links = [
  { href: '/chigaga/dashboard', label: 'Overview', icon: FiBarChart2 },
  { href: '/chigaga/students', label: 'Students', icon: FiUsers },
  { href: '/chigaga/transaction', label: 'Transactions', icon: FiCreditCard },
  { href: '/chigaga/certificate', label: 'Certificates', icon: FiAward },
  { href: '/chigaga/media', label: 'Media library', icon: FiImage },
  { href: '/chigaga/create', label: 'Admin team', icon: FiUserPlus },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const logout = async () => {
    await axios.post('/api/admin/logout');
    router.push('/chigaga');
    router.refresh();
  };

  return (
    <>
      <header className="admin-mobile-bar">
        <Link href="/chigaga/dashboard">
          <Image src="/powertrust-icon.png" alt="PowerTrust" width={36} height={36} priority />
          <span><strong>PowerTrust</strong><small>Operations</small></span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open admin navigation" aria-expanded={open} aria-controls="admin-navigation"><FiMenu /></button>
      </header>

      {open && <button className="admin-nav-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <aside id="admin-navigation" className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-side-head">
          <Link href="/chigaga/dashboard" className="admin-side-brand" onClick={() => setOpen(false)}>
            <Image src="/powertrust-icon.png" alt="" width={44} height={44} priority />
            <span><strong>PowerTrust</strong><small>Operations console</small></span>
          </Link>
          <button className="admin-drawer-close" onClick={() => setOpen(false)} aria-label="Close admin navigation"><FiX /></button>
        </div>

        <div className="admin-side-label">Workspace</div>
        <nav>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href as any} className={active ? 'active' : ''} onClick={() => setOpen(false)}><Icon /><span>{label}</span>{active && <i />}</Link>;
          })}
        </nav>

        <div className="admin-side-bottom">
          <Link href="/" target="_blank">Public website <FiExternalLink /></Link>
          <button onClick={logout}><FiLogOut /> Sign out</button>
        </div>
      </aside>
    </>
  );
}
