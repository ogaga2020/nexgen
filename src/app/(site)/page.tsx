'use client';

import { useRouter } from 'next/navigation';
import Accordion from './Accordion';

export default function HomePage() {
  const router = useRouter();

  const plans = [
    { months: 4, cost: 250000 },
    { months: 8, cost: 450000 },
    { months: 12, cost: 700000 },
  ];

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <main className="font-ui">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">
            Learn by doing • Electrical • Solar • Plumbing
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight">
            NexGen Flow & Power
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Empowering the next generation with practical, job ready technical skills.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => router.push('/register')}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm hover:shadow-md hover:bg-gray-100 transition"
            >
              Register Now
            </button>
            <a
              href="#why"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
            >
              Why NexGen?
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
      </section>

      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-900">What We Offer</h2>
            <p className="mt-2 text-gray-600">
              A focused curriculum with hands-on workshops and real projects.
            </p>
          </div>
          <div className="mt-8">
            <Accordion />
          </div>
        </div>
      </section>

      <section id="why" className="bg-gray-50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-900">Why Train With Us?</h2>
            <p className="mt-2 text-gray-600">
              Tailored for beginners and upskillers who want marketable skills fast.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10 hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Expert Instructors</h3>
              <p className="mt-1 text-gray-600">Learn from professionals with field experience and real installations.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10 hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Affordable & Flexible</h3>
              <p className="mt-1 text-gray-600">Installment options: start with an initial payment, complete before graduation.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10 hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Career Support</h3>
              <p className="mt-1 text-gray-600">Mentorship, project referrals and guidance to launch your practice.</p>
            </div>
          </div>

          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <ul className="space-y-4 text-gray-800">
              {[
                'Hands-on workshop sessions every week',
                'Modern equipment and safe training environment',
                'Small cohorts for closer guidance',
                'Portfolio-ready projects and assessments',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
                  <span className="text-lg">{t}</span>
                </li>
              ))}
            </ul>

            <img
              src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop"
              alt="Training at NexGen"
              className="h-72 w-full rounded-2xl object-cover shadow-sm ring-1 ring-black/10 md:h-80"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-blue-900">Program Duration & Cost</h2>
          <p className="mt-2 text-gray-600">Pay in installments: 60% upfront, 40% before graduation.</p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl grid gap-4 sm:hidden">
          {plans.map(({ months, cost }) => {
            const sixty = Math.round(cost * 0.6);
            const forty = cost - sixty;
            return (
              <div key={months} className="rounded-xl border p-4 shadow-sm ring-1 ring-black/5 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{months} Months</div>
                  <a
                    href={`/register?duration=${months}`}
                    className="rounded-md border border-blue-600 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                  >
                    Register
                  </a>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="rounded bg-gray-50 p-2">
                    <div className="text-xs text-gray-500">Tuition</div>
                    <div className="font-medium">{fmt(cost)}</div>
                  </div>
                  <div className="rounded bg-gray-50 p-2">
                    <div className="text-xs text-gray-500">60% Now</div>
                    <div className="font-medium">{fmt(sixty)}</div>
                  </div>
                  <div className="rounded bg-gray-50 p-2 col-span-2">
                    <div className="text-xs text-gray-500">40% Before Graduation</div>
                    <div className="font-medium">{fmt(forty)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-6 hidden overflow-x-auto rounded-xl border ring-1 ring-black/5 sm:block max-w-4xl bg-white">
          <table className="min-w-[720px] w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-gray-600 text-xs">
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold text-center">Tuition</th>
                <th className="py-3 px-4 font-semibold text-center">60% Now</th>
                <th className="py-3 px-4 font-semibold text-center">40% Before Graduation</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {plans.map(({ months, cost }, i) => {
                const sixty = Math.round(cost * 0.6);
                const forty = cost - sixty;
                return (
                  <tr key={months} className={i % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">{months} Months</td>
                    <td className="py-3 px-4 text-center">{fmt(cost)}</td>
                    <td className="py-3 px-4 text-center">{fmt(sixty)}</td>
                    <td className="py-3 px-4 text-center">{fmt(forty)}</td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`/register?duration=${months}`}
                        className="inline-block rounded-md border border-blue-600 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                      >
                        Register
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Begin Your Career?</h2>
          <p className="mt-3 md:mt-4 text-lg text-white/90">
            Join NexGen Flow & Power and learn from the best.
          </p>
          <div className="mt-8">
            <button
              onClick={() => router.push('/register')}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm hover:shadow-md hover:bg-gray-100 transition"
            >
              Start Registration
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      </section>
    </main>
  );
}
