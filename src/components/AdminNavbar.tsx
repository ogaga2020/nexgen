'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { FiAward, FiBarChart2, FiCreditCard, FiImage, FiLogOut, FiMenu, FiUsers, FiUserPlus, FiX } from 'react-icons/fi';

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

  const logout = async () => {
    await axios.post('/api/admin/logout');
    router.push('/chigaga');
    router.refresh();
  };

  return (
    <>
      <header className="admin-mobile-bar">
        <Link href="/chigaga/dashboard"><Image src="/powertrust-icon.png" alt="PowerTrust" width={38} height={38} /><strong>PowerTrust <span>Ops</span></strong></Link>
        <button onClick={() => setOpen(!open)} aria-label="Toggle admin navigation">{open ? <FiX /> : <FiMenu />}</button>
      </header>

      {open && <button className="admin-nav-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <Link href="/chigaga/dashboard" className="admin-side-brand" onClick={() => setOpen(false)}>
          <Image src="/powertrust-icon.png" alt="" width={48} height={48} />
          <span><strong>POWER<span>TRUST</span></strong><small>OPERATIONS</small></span>
        </Link>

        <div className="admin-side-label">Workspace</div>
        <nav>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href as any} className={active ? 'active' : ''} onClick={() => setOpen(false)}><Icon /><span>{label}</span>{active && <i />}</Link>;
          })}
        </nav>

        <div className="admin-side-bottom">
          <Link href="/" target="_blank">View public website ↗</Link>
          <button onClick={logout}><FiLogOut /> Sign out</button>
        </div>
      </aside>
    </>
  );
}
