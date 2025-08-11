'use client';

import { useRouter } from 'next/navigation';
import Accordion from './Accordion';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <div className="font-ui">
        <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">NexGen Flow & Power</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">Empowering the next generation of professionals in Electrical, Solar Systems and plumbing.</p>
          <button onClick={() => router.push('/register')} className="mt-8 bg-white text-blue-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
            Register Now
          </button>
        </section>

        <section className="py-16 px-4 bg-white text-center">
          <h2 className="text-3xl font-semibold mb-10 text-primary">What We Offer</h2>
          <Accordion />
        </section>

        <section className="bg-gray-50 py-16 px-4">
          <h2 className="text-3xl font-semibold mb-10 text-primary text-center">Why Train With Us?</h2>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <ul className="space-y-5 text-gray-800">
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
                <span className="text-lg">Expert instructors with real-world experience</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
                <span className="text-lg">Affordable training with flexible installment plans</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
                <span className="text-lg">Modern training equipment and environment</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
                <span className="text-lg">Mentorship, job referrals, and startup guidance</span>
              </li>
            </ul>

            <img
              src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop"
              alt="Motivation and success"
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
              loading="lazy"
            />
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <h2 className="text-3xl font-semibold text-primary mb-4 text-center">Program Duration & Cost</h2>
          <p className="text-gray-600 text-center mb-10">Pay in installments: 60% upfront, 40% before graduation.</p>

          <div className="max-w-4xl mx-auto grid gap-4 sm:hidden">
            {[
              { months: 4, cost: 400000 },
              { months: 8, cost: 800000 },
              { months: 12, cost: 1100000 },
            ].map(({ months, cost }) => {
              const sixty = Math.round(cost * 0.6);
              const forty = cost - sixty;
              const fmt = (n: number) => `₦${n.toLocaleString()}`;
              return (
                <div key={months} className="rounded-lg border p-4 shadow-sm">
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
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">Tuition</div>
                      <div className="font-medium">{fmt(cost)}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">60% Now</div>
                      <div className="font-medium">{fmt(sixty)}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">40% Before Grad</div>
                      <div className="font-medium">{fmt(forty)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto rounded-lg border hidden sm:block">
            <table className="w-full text-left min-w-[680px]">
              <thead className="bg-gray-50">
                <tr className="text-gray-600 text-xs sm:text-sm">
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Tuition</th>
                  <th className="py-3 px-4 font-semibold">60% Now</th>
                  <th className="py-3 px-4 font-semibold">40% Before Graduation</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {[
                  { months: 4, cost: 400000 },
                  { months: 8, cost: 800000 },
                  { months: 12, cost: 1100000 },
                ].map(({ months, cost }) => {
                  const sixty = Math.round(cost * 0.6);
                  const forty = cost - sixty;
                  const fmt = (n: number) => `₦${n.toLocaleString()}`;
                  return (
                    <tr key={months} className="hover:bg-blue-50/40">
                      <td className="py-4 px-4 font-semibold text-gray-900">{months} Months</td>
                      <td className="py-4 px-4">{fmt(cost)}</td>
                      <td className="py-4 px-4">{fmt(sixty)}</td>
                      <td className="py-4 px-4">{fmt(forty)}</td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <a
                          href={`/register?duration=${months}`}
                          className="inline-block rounded-md border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition"
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

        <section className="bg-blue-900 text-white py-20 px-4 text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to Begin Your Career?</h2>
          <p className="text-lg mb-6">Join NexGen Flow & Power and learn from the best.</p>
          <button onClick={() => router.push('/register')} className="bg-white text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
            Start Registration
          </button>
        </section>
      </div>
    </>
  );
}
