'use client';

import { useEffect, useRef, useState } from 'react';

const numbers = [
  { label: 'Primary line', display: '0803 937 5634', href: 'tel:+2348039375634' },
  { label: 'Alternate line', display: '0916 584 4382', href: 'tel:+2349165844382' },
];

export default function ContactActions({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const buttonClass = `${compact ? 'h-9 w-9' : 'h-11 w-11'} grid place-items-center rounded-full border transition hover:-translate-y-0.5 ${light ? 'border-white/15 bg-white/10 text-white hover:bg-white hover:text-[#071b35]' : 'border-slate-200 bg-white text-[#071b35] hover:border-[#0876d1] hover:text-[#0876d1]'}`;

  return (
    <div className="flex items-center gap-2" ref={wrapper}>
      <div className="relative">
        <button type="button" onClick={() => setOpen((value) => !value)} className={buttonClass} aria-label="Choose a phone number" aria-expanded={open}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" /></svg>
        </button>
        {open && (
          <div className="absolute right-0 top-[calc(100%+.65rem)] z-[70] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-[#071b35] shadow-[0_24px_70px_rgba(4,20,38,.22)]" role="menu" aria-label="Phone numbers">
            <p className="px-3 pb-2 pt-2 text-[.65rem] font-extrabold uppercase tracking-[.16em] text-slate-400">Choose a line</p>
            {numbers.map((number) => (
              <a key={number.href} href={number.href} role="menuitem" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-[#eef6fd]">
                <span><span className="block text-xs font-bold text-slate-400">{number.label}</span><span className="mt-0.5 block text-sm font-extrabold">{number.display}</span></span>
                <span className="text-[#0876d1]">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <a href="mailto:ogagaenterprise@gmail.com" className={buttonClass} aria-label="Email PowerTrust Energy Limited">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
      </a>
    </div>
  );
}
