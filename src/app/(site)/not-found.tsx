import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative grid min-h-[calc(100svh-76px)] place-items-center overflow-hidden bg-[#061a33] px-6 py-20 text-white">
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[70px] border-[#0876d1]/10" />
      <div className="relative max-w-xl text-center">
        <span className="text-[clamp(6rem,20vw,11rem)] font-black leading-none tracking-[-.08em] text-[#65bd00]">404</span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[.2em] text-[#8fd445]">Circuit not connected</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">This page cannot be found.</h1>
        <p className="mx-auto mt-5 max-w-md leading-7 text-slate-300">The address may have changed, or the page may no longer be available.</p>
        <Link href="/" className="mt-9 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-[#061a33] transition hover:-translate-y-1 hover:bg-[#65bd00]">Return home</Link>
      </div>
    </main>
  );
}
