import Image from 'next/image';
import Link from 'next/link';

export default function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="PowerTrust Energy Limited home">
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white shadow-[0_8px_30px_rgba(7,41,82,.18)] ring-1 ring-slate-900/5 transition-transform group-hover:-rotate-3 group-hover:scale-105">
        <Image src="/powertrust-icon.png" alt="" fill sizes="44px" className="object-cover" priority />
      </span>
      <span className="leading-none">
        <span className={`block text-[1.05rem] font-extrabold tracking-[-0.035em] ${light ? 'text-white' : 'text-[#071b35]'}`}>
          <span className="text-[#54a800]">POWER</span><span className={light ? 'text-white' : 'text-[#0876d1]'}>TRUST</span>
        </span>
        <span className={`mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.28em] ${light ? 'text-white/55' : 'text-slate-500'}`}>
          Energy Limited
        </span>
      </span>
    </Link>
  );
}
