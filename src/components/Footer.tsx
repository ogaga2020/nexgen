import Link from 'next/link';
import BrandMark from './BrandMark';
import ContactActions from './ContactActions';

export default function Footer() {
  return (
    <footer className="bg-[#041426] text-white">
      <div className="site-shell py-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_.7fr_.7fr_1fr]">
          <div><BrandMark light /><p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">Dependable electrical, solar and plumbing solutions, designed, installed and maintained by people who care about the details.</p><div className="mt-5"><ContactActions light /></div></div>
          <div><h3 className="text-xs font-extrabold uppercase tracking-[.18em] text-slate-500">Company</h3><div className="mt-5 grid gap-3 text-sm text-slate-300"><Link href="/about">About us</Link><Link href="/projects">Projects</Link><Link href="/register">Training registration</Link></div></div>
          <div><h3 className="text-xs font-extrabold uppercase tracking-[.18em] text-slate-500">Solutions</h3><div className="mt-5 grid gap-3 text-sm text-slate-300"><Link href="/training#electrical">Electrical</Link><Link href="/training#solar">Solar energy</Link><Link href="/training#plumbing">Plumbing</Link></div></div>
          <div><h3 className="text-xs font-extrabold uppercase tracking-[.18em] text-slate-500">Visit</h3><p className="mt-5 text-sm leading-7 text-slate-300">No. 28A James Ejawan Plaza,<br />Ugborikoko, Airport Road.</p><p className="mt-3 text-sm text-slate-500">Mon–Fri · 9:00–17:00</p></div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} PowerTrust Energy Limited.</p><p>Built for dependable energy and infrastructure.</p></div>
      </div>
    </footer>
  );
}
