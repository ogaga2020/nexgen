import Image from 'next/image';
import Link from 'next/link';

const services = [
  { no: '01', title: 'Electrical systems', copy: 'Safe, efficient installations, upgrades, fault diagnosis and maintenance for homes and businesses.', href: '/training#electrical', accent: 'bg-[#0876d1]' },
  { no: '02', title: 'Solar & backup power', copy: 'Right-sized solar, inverter and battery systems built around your actual energy demand.', href: '/training#solar', accent: 'bg-[#65bd00]' },
  { no: '03', title: 'Plumbing infrastructure', copy: 'Clean water distribution, sanitary systems, repairs and durable commercial pipework.', href: '/training#plumbing', accent: 'bg-[#ff7a00]' },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[calc(100svh-76px)] overflow-hidden bg-[#061a33] text-white">
        <Image src="/powertrust-hero.png" alt="PowerTrust technicians working across solar, electrical and plumbing systems" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061a33] via-[#061a33]/90 to-[#061a33]/5" />
        <div className="absolute inset-0 brand-grid opacity-40" />
        <div className="site-shell relative flex min-h-[calc(100svh-76px)] items-center py-12 md:py-16">
          <div className="max-w-[690px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#b8eb7c] backdrop-blur">Integrated technical solutions</span>
            <h1 className="display-title mt-7 text-[clamp(2.65rem,5.5vw,4.75rem)]">Power built<br /><span className="text-[#68c700]">to be trusted.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-200 md:text-lg">Electrical, solar and plumbing systems engineered for safer homes, stronger businesses and a more reliable future.</p>
            <div className="mt-10 flex flex-wrap gap-3"><a href="https://wa.me/2348039375634?text=Hello%20PowerTrust%2C%20I%20need%20a%20project%20consultation." target="_blank" rel="noreferrer" className="rounded-full bg-[#65bd00] px-7 py-4 text-sm font-extrabold text-[#061a33] transition hover:-translate-y-1 hover:bg-[#7cdb17]">Request a consultation</a><Link href="/projects" className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white hover:text-[#061a33]">View our work</Link></div>
            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-7"><div><strong className="block text-2xl">3-in-1</strong><span className="text-xs uppercase tracking-wider text-slate-400">Technical expertise</span></div><div><strong className="block text-2xl">Hands-on</strong><span className="text-xs uppercase tracking-wider text-slate-400">Delivery & training</span></div><div><strong className="block text-2xl">Safety-first</strong><span className="text-xs uppercase tracking-wider text-slate-400">Every project</span></div></div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="site-shell">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><span className="eyebrow">What we do</span><h2 className="display-title mt-5 text-3xl text-[#071b35] md:text-5xl">One team.<br />Every essential system.</h2></div><p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end">PowerTrust brings three critical building services under one accountable team, from first assessment to installation, testing and aftercare.</p></div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">{services.map((service) => <Link href={service.href as any} key={service.no} className="service-card group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-7 md:p-9"><div className={`h-1.5 w-14 rounded-full ${service.accent}`} /><div className="mt-12 flex items-center justify-between"><span className="text-xs font-extrabold tracking-[.2em] text-slate-400">{service.no}</span><span className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#0876d1] transition group-hover:rotate-45 group-hover:bg-[#071b35] group-hover:text-white">↗</span></div><h3 className="mt-7 text-xl font-extrabold tracking-tight text-[#071b35]">{service.title}</h3><p className="mt-4 leading-7 text-slate-600">{service.copy}</p></Link>)}</div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#eaf3fb] py-24 md:py-32">
        <div className="site-shell grid items-center gap-14 lg:grid-cols-2">
          <div className="relative"><div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-[#65bd00]/20 blur-2xl" /><div className="relative overflow-hidden rounded-[2.2rem] bg-white p-5 shadow-[0_35px_90px_rgba(5,39,74,.15)]"><Image src="/logo.jpeg" alt="PowerTrust Energy Limited" width={1000} height={1000} className="aspect-square w-full rounded-[1.7rem] object-cover" /></div></div>
          <div><span className="eyebrow">Why PowerTrust</span><h2 className="display-title mt-5 text-3xl text-[#071b35] md:text-5xl">Technical confidence, from brief to handover.</h2><p className="mt-7 text-base leading-7 text-slate-600">We combine practical field experience, transparent recommendations and disciplined workmanship. You get systems that are easier to operate, safer to maintain and ready for real life.</p><div className="mt-9 grid gap-3 sm:grid-cols-2">{['Detailed site assessment','Clear project scope','Quality materials','Neat installation','Safety & testing','Responsive support'].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-3 font-bold text-[#0b2a4b]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#65bd00] text-xs text-white">✓</span>{item}</div>)}</div><Link href="/about" className="mt-9 inline-flex items-center gap-2 font-extrabold text-[#0876d1]">Meet PowerTrust <span>→</span></Link></div>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="site-shell grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[2rem] bg-[#071b35] p-8 text-white md:p-12"><span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#8bd338]">Build a technical career</span><h2 className="display-title mt-5 text-3xl md:text-4xl">Learn the work by doing the work.</h2><p className="mt-6 leading-7 text-slate-300">Practical programs in electrical installation, solar energy and plumbing with real tools, guided projects and flexible durations.</p><Link href="/register" className="mt-9 inline-block rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#071b35]">Start your application</Link></div>
          <div className="grid gap-4 sm:grid-cols-3">{[{m:'4',fee:'₦350k',note:'Focused foundation'},{m:'8',fee:'₦550k',note:'Professional track'},{m:'12',fee:'₦750k',note:'Full mastery'}].map((plan, i) => <Link href={`/register?duration=${plan.m}` as any} key={plan.m} className={`service-card rounded-[2rem] border p-7 ${i===1?'border-[#0876d1] bg-[#0876d1] text-white':'border-slate-200 bg-slate-50 text-[#071b35]'}`}><span className={`text-xs font-extrabold uppercase tracking-wider ${i===1?'text-white/65':'text-slate-400'}`}>Duration</span><strong className="mt-5 block text-5xl tracking-tighter">{plan.m}<small className="ml-1 text-base font-bold">mo</small></strong><p className={`mt-5 text-sm ${i===1?'text-white/75':'text-slate-500'}`}>{plan.note}</p><div className={`mt-8 border-t pt-5 ${i===1?'border-white/20':'border-slate-200'}`}><span className="text-xs opacity-70">Tuition</span><strong className="block text-xl">{plan.fee}</strong></div></Link>)}</div>
        </div>
      </section>

      <section className="bg-[#65bd00] py-20 text-[#061a33]"><div className="site-shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"><div><span className="text-xs font-extrabold uppercase tracking-[.18em]">Have a project in mind?</span><h2 className="display-title mt-3 text-3xl md:text-5xl">Let’s make it work properly.</h2></div><a href="https://wa.me/2348039375634?text=Hello%20PowerTrust%2C%20I%20would%20like%20to%20discuss%20a%20project." target="_blank" rel="noreferrer" className="rounded-full bg-[#061a33] px-8 py-4 text-sm font-extrabold text-white">Talk to our team →</a></div></section>
    </main>
  );
}
