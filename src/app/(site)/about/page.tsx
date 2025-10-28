import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="font-ui text-[var(--foreground)]">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600" />

                <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90 ring-1 ring-white/15">
                            Building skilled talent for tomorrow
                        </span>
                        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                            About <span className="text-blue-300">Ogaga-Enterprise</span>
                        </h1>
                        <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/90 leading-relaxed">
                            We don’t just train people, we shape a workforce that powers homes,
                            wires cities, and builds sustainable futures.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-3">
                        {[
                            { k: '3 Programs', v: 'Electrical • Plumbing • Solar' },
                            { k: 'Hands-on', v: 'Workshop-first learning' },
                            { k: 'Career Path', v: 'Mentorship & referrals' },
                        ].map((s) => (
                            <div
                                key={s.k}
                                className="rounded-2xl bg-white/10 backdrop-blur-xl text-white p-6 ring-1 ring-white/15 transition hover:bg-white/15 hover:shadow-lg"
                            >
                                <div className="text-sm opacity-80">{s.k}</div>
                                <div className="mt-1 font-semibold text-lg">{s.v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl" />
            </section>

            <section className="py-16 md:py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2 md:items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Who We Are</h2>
                        <p className="mt-4 text-gray-700 leading-relaxed">
                            <span className="font-semibold">Ogaga-Enterprise</span> is a technical training hub dedicated to equipping
                            individuals with in-demand skills in <span className="font-semibold">Electrical Installation</span>,{' '}
                            <span className="font-semibold">Plumbing Systems</span>, and{' '}
                            <span className="font-semibold">Solar Energy Technologies</span>. With years of hands-on industry experience, our
                            instructors prepare trainees to be competent, confident, and ready for real-world delivery.
                        </p>

                        <div className="mt-6 grid gap-3">
                            {[
                                'Industry-aligned curriculum that keeps you ahead',
                                'Workshop-based training with real tools and safety standards',
                                'Mentorship, job referrals, and startup guidance',
                                'Flexible installments with accessible pricing',
                            ].map((line) => (
                                <div key={line} className="flex items-start gap-3">
                                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
                                    <p className="text-gray-800">{line}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-lg">
                            <Image
                                src="https://t3.ftcdn.net/jpg/01/05/11/04/360_F_105110489_PQGeKf7q24LfRJMt3c1iNaLmeSeFZZHo.jpg"
                                alt="Ogaga-Enterprise training and practice"
                                width={1200}
                                height={800}
                                className="object-cover"
                                priority
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6 grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Our Vision</h2>
                        <p className="mt-4 text-gray-700 leading-relaxed">
                            To become Africa’s go-to platform for skill acquisition and bridging the gap between talent and opportunity. We train
                            people who wire, pipe, and power the future.
                        </p>
                    </div>

                    <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                        {[
                            { t: 'Excellence', d: 'Industry-grade standards and safety-first delivery.' },
                            { t: 'Practicality', d: 'Tools in hand, real installations, real scenarios.' },
                            { t: 'Support', d: 'Mentors, community, and career opportunities.' },
                            { t: 'Sustainability', d: 'Solar-first mindset for a resilient future.' },
                        ].map((card) => (
                            <div
                                key={card.t}
                                className="rounded-2xl bg-white p-5 ring-1 ring-black/10 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold">{card.t}</h3>
                                </div>
                                <p className="mt-3 text-gray-700">{card.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Meet the Instructors</h2>
                        <p className="mt-2 text-gray-600">Experienced professionals with a passion for teaching.</p>
                    </div>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-black/10">
                                    <Image
                                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                                        alt="Instructor"
                                        width={160}
                                        height={160}
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Mr. Chidi Okafor</h3>
                                    <p className="text-sm text-gray-600">Electrical • Solar</p>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-700 leading-relaxed">
                                Chidi brings field experience from residential and commercial projects, with a strong focus on safety and
                                neat, maintainable installs.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-black/10">
                                    <Image
                                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                                        alt="Instructor"
                                        width={160}
                                        height={160}
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Engr. Amaka Udu</h3>
                                    <p className="text-sm text-gray-600">Plumbing</p>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-700 leading-relaxed">
                                Amaka specializes in modern water systems, efficient layouts, and leak-proof standards from planning to testing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-600" />

                <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-extrabold">Start Your Journey With Us</h2>
                    <p className="mt-3 md:mt-4 text-lg text-white/90">
                        Learn from experts. Train with real equipment. Build a career that lasts.
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm hover:shadow-md hover:bg-gray-100 transition"
                        >
                            Register Now
                        </Link>
                    </div>
                </div>

                <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            </section>
        </main>
    );
}
