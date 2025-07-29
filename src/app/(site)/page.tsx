'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    // <>
    //   <div className="font-ui">
    //     <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-20 px-4 text-center">
    //       <h1 className="text-4xl md:text-5xl font-bold mb-4">NexGen Flow & Power</h1>
    //       <p className="text-lg md:text-xl max-w-2xl mx-auto">Empowering the next generation of professionals in Electrical, Plumbing, and Solar Systems</p>
    //       <button onClick={() => router.push('/register')} className="mt-8 bg-white text-blue-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
    //         Register Now
    //       </button>
    //     </section>

    //     <section className="py-16 px-4 bg-white text-center">
    //       <h2 className="text-3xl font-semibold mb-10 text-primary">What We Offer</h2>
    //       <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    //         {['Electrical Installation', 'Plumbing Systems', 'Solar Energy'].map((service) => (
    //           <div key={service} className="shadow-lg rounded-lg p-6 border">
    //             <h3 className="text-xl font-bold mb-2 text-primary">{service}</h3>
    //             <p className="text-gray-600">Hands-on, expert-led training to equip you for real-world success.</p>
    //           </div>
    //         ))}
    //       </div>
    //     </section>

    //     <section className="bg-gray-50 py-16 px-4 text-center">
    //       <h2 className="text-3xl font-semibold mb-10 text-primary">Why Train With Us?</h2>
    //       <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
    //         <div className="text-left">
    //           <ul className="space-y-4 list-disc list-inside text-gray-700">
    //             <li>Expert instructors with real-world experience</li>
    //             <li>Affordable training with flexible installment plans</li>
    //             <li>Modern training equipment and environment</li>
    //             <li>Opportunity for mentorship and job referrals</li>
    //           </ul>
    //         </div>
    //         <div>
    //           <img src="/logo.png" alt="NexGen Logo" className="w-64 mx-auto" />
    //         </div>
    //       </div>
    //     </section>

    //     <section className="py-16 px-4 text-center bg-white">
    //       <h2 className="text-3xl font-semibold text-primary mb-8">Program Duration & Cost</h2>
    //       <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    //         {[
    //           { months: 4, cost: '₦400,000' },
    //           { months: 8, cost: '₦800,000' },
    //           { months: 12, cost: '₦1,100,000' }
    //         ].map((plan) => (
    //           <div key={plan.months} className="border p-6 rounded-lg shadow">
    //             <h3 className="text-xl font-bold text-primary mb-2">{plan.months} Months</h3>
    //             <p className="text-lg font-semibold">{plan.cost}</p>
    //           </div>
    //         ))}
    //       </div>
    //     </section>

    //     <section className="bg-blue-900 text-white py-20 px-4 text-center">
    //       <h2 className="text-3xl font-semibold mb-4">Ready to Begin Your Career?</h2>
    //       <p className="text-lg mb-6">Join NexGen Flow & Power and learn from the best.</p>
    //       <button onClick={() => router.push('/register')} className="bg-white text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
    //         Start Registration
    //       </button>
    //     </section>
    //   </div>
    // </>

    <div className="bg-green-500 text-white p-6 text-2xl text-center">
      Tailwind is now working!
    </div>

  );
}
