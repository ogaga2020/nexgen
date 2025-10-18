'use client';

import { useRouter } from 'next/navigation';

export default function TrainingDetailsPage() {
    const router = useRouter();

    const Bullet = () => (
        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600/90"></span>
    );

    return (
        <main className="font-ui">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700" />
                <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24 text-center text-white">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">
                        Industry-aligned, hands-on training
                    </div>
                    <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                        Training Program Details
                    </h1>
                    <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                        Comprehensive, real-world training to prepare you for success in Electrical, Solar, and Plumbing systems.
                    </p>
                </div>
                <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
            </section>

            <section className="px-6 py-16 md:py-20 bg-white">
                <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-semibold text-primary">Electrical Installation</h2>
                        <p className="mt-4 text-gray-700">
                            Our Electrical Installation training equips you with the skills to plan, size, and implement inverter-based
                            systems for residential and light commercial use.
                        </p>
                        <p className="mt-4 text-gray-700">You’ll gain practical understanding of:</p>

                        <ul className="mt-4 space-y-3 text-gray-800">
                            <li className="flex items-start gap-3"><Bullet /><span>How to determine energy load requirements</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Battery and inverter sizing based on real-world applications</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Solar panel configuration and mounting principles</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Safe installation practices and compliance standards</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Efficient power distribution and system optimization</span></li>
                        </ul>

                        <p className="mt-6 font-medium text-gray-900">
                            By the end of the training, you’ll be able to confidently evaluate and build setups for homes, small offices, and commercial spaces.
                        </p>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-2 ring-1 ring-black/10 shadow-sm">
                            <img
                                src="https://media.istockphoto.com/id/1409304338/photo/electricity-and-electrical-maintenance-service-engineer-hand-holding-ac-multimeter-checking.jpg?s=612x612&w=0&k=20&c=Pj3gqobTp67aPN8l-lm6q-uT2DDnm-aeFk7Gkvmbaok="
                                alt="Electrical installation practice"
                                loading="lazy"
                                className="h-72 w-full rounded-xl object-cover md:h-[22rem]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 md:py-20 bg-gray-50">
                <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
                    <div>
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-2 ring-1 ring-black/10 shadow-sm">
                            <img
                                src="https://media.istockphoto.com/id/1665925516/photo/renewable-energy-solar-panels-and-team-walking-on-roof-planning-for-inspection-at-sustainable.jpg?s=612x612&w=0&k=20&c=gEUl4TPBqLNZiQQDnyI217t46oxYMnz9Xz9jcR8avjk="
                                alt="Solar energy installation"
                                loading="lazy"
                                className="h-72 w-full rounded-xl object-cover md:h-[22rem]"
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-semibold text-primary">Solar Energy Training</h2>
                        <p className="mt-4 text-gray-700">
                            Our solar energy track focuses on the design, installation, and maintenance of solar systems for homes and businesses.
                        </p>

                        <ul className="mt-4 space-y-3 text-gray-800">
                            <li className="flex items-start gap-3"><Bullet /><span>Introduction to solar technologies (PV, hybrid, off-grid)</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Solar panel orientation, sizing, and tilt configuration</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Battery types and energy storage systems</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Inverter and charge controller setup</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Wiring, safety, and local regulation compliance</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Installation techniques for rooftops and ground mounts</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Troubleshooting and maintenance of solar systems</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Hands-on live installations and simulations</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 md:py-20 bg-white">
                <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-semibold text-primary">Plumbing Systems Training</h2>
                        <p className="mt-4 text-gray-700">
                            Gain solid skills in both residential and commercial plumbing. Our program includes:
                        </p>

                        <ul className="mt-4 space-y-3 text-gray-800">
                            <li className="flex items-start gap-3"><Bullet /><span>Understanding water systems and sanitation</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Pipe fitting (PVC, PPR, copper, iron, etc.)</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Installation of toilets, faucets, sinks, showers, and heaters</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Leak detection, repair, and soldering techniques</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Pressure testing and troubleshooting</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Drainage systems and septic setup</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Building code compliance and plumbing safety</span></li>
                            <li className="flex items-start gap-3"><Bullet /><span>Practical on-site training sessions</span></li>
                        </ul>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white p-2 ring-1 ring-black/10 shadow-sm">
                            <img
                                src="https://img.freepik.com/premium-photo/plumber-work-bathroom-plumbing-repair-service-assemble-install-concept_887079-38.jpg?semt=ais_hybrid&w=740&q=80"
                                alt="Plumbing workshop"
                                loading="lazy"
                                className="h-72 w-full rounded-xl object-cover md:h-[22rem]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 md:py-20 bg-gray-50">
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 ring-1 ring-black/10 shadow-sm">
                        <div className="text-sm text-gray-500">Learning style</div>
                        <div className="mt-1 font-semibold text-gray-900">Workshop-first approach</div>
                        <p className="mt-3 text-gray-700">Train with real tools on simulated job environments to build confidence fast.</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 ring-1 ring-black/10 shadow-sm">
                        <div className="text-sm text-gray-500">Support</div>
                        <div className="mt-1 font-semibold text-gray-900">Mentorship & referrals</div>
                        <p className="mt-3 text-gray-700">Portfolio guidance, interview prep, and links to employers and contractors.</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 ring-1 ring-black/10 shadow-sm">
                        <div className="text-sm text-gray-500">Payments</div>
                        <div className="mt-1 font-semibold text-gray-900">Flexible installments</div>
                        <p className="mt-3 text-gray-700">60% upfront and 40% before graduation, with clear reminders and tracking.</p>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700" />
                <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Join a Training Program?</h2>
                    <p className="mt-3 md:mt-4 text-lg text-white/90">Apply now and start learning hands-on skills with our experts.</p>
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <button
                            onClick={() => router.push('/register')}
                            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm hover:shadow-md hover:bg-gray-50 transition"
                        >
                            Apply Now
                        </button>
                        <a
                            href="/about"
                            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            </section>
        </main>
    );
}
