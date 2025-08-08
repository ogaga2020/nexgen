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

        <section className="bg-gray-50 py-16 px-4 text-center">
          <h2 className="text-3xl font-semibold mb-10 text-primary">Why Train With Us?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="text-left">
              <ul className="space-y-4 list-disc list-inside text-gray-700">
                <li>Expert instructors with real-world experience</li>
                <li>Affordable training with flexible installment plans</li>
                <li>Modern training equipment and environment</li>
                <li>Opportunity for mentorship and job referrals</li>
              </ul>
            </div>
            <div>
              <img src="/logo.png" alt="NexGen Logo" className="w-64 mx-auto" />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <h2 className="text-3xl font-semibold text-primary mb-4 text-center">Program Duration & Cost</h2>
          <p className="text-gray-600 text-center mb-10">Pay in installments: 60% upfront, 40% before graduation.</p>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-lg border">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-gray-600 text-sm">
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Tuition</th>
                  <th className="py-3 px-4 font-semibold">60% Now</th>
                  <th className="py-3 px-4 font-semibold">40% Before Graduation</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
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
                      <td className="py-4 px-4 text-right">
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
