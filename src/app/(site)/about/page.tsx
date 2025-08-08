'use client';

import Image from 'next/image';

export default function AboutPage() {
    return (
        <main className="font-ui">
            <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">About NexGen</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">
                    We are not just training people, we are building a skilled workforce for the future.
                </p>
            </section>

            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-semibold text-primary mb-6">Who We Are</h2>
                    <p className="text-gray-700 leading-relaxed mb-8">
                        NexGen Flow & Power is a technical training hub dedicated to equipping individuals with
                        in-demand skills in <span className="font-semibold">Electrical Installation</span>,
                        <span className="font-semibold"> Plumbing Systems</span>, and
                        <span className="font-semibold"> Solar Energy Technologies</span>.
                        With years of hands-on industry experience, we prepare our trainees to be competent, confident, and ready to deliver in real-world situations.
                    </p>

                    <h3 className="text-2xl font-semibold text-primary mb-4">What Makes Us Different?</h3>
                    <ul className="list-disc list-inside space-y-3 text-gray-700">
                        <li>Industry-aligned curriculum that keeps you ahead</li>
                        <li>Hands-on, workshop-based training with real tools</li>
                        <li>Mentorship, job referrals, and startup guidance</li>
                        <li>Affordable pricing with flexible installment plans</li>
                    </ul>
                </div>
            </section>

            <section className="bg-gray-50 py-16 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl font-semibold text-primary mb-4">Our Vision</h2>
                        <p className="text-gray-700 leading-relaxed">
                            To become Africa’s go-to platform for skill acquisition and professional training.
                            We aim to bridge the gap between talent and opportunity, ensuring our graduates
                            are fully equipped to thrive in their chosen fields.
                        </p>
                    </div>
                    <div>
                        <Image
                            src="/logo.png"
                            alt="NexGen Logo"
                            width={300}
                            height={300}
                            className="mx-auto md:mx-0"
                        />
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-white text-center">
                <h2 className="text-3xl font-semibold text-primary mb-6">Meet the Instructors</h2>
                <p className="text-gray-700 max-w-xl mx-auto mb-10">
                    Our trainers are certified professionals with years of field experience.
                    They focus on teaching proven techniques, sharing real-world examples,
                    and ensuring every trainee gains confidence and mastery.
                </p>
                <p className="text-sm text-gray-500 italic">Instructor profiles coming soon...</p>
            </section>

            <section className="bg-blue-900 text-white py-20 px-4 text-center">
                <h2 className="text-3xl font-semibold mb-4">Start Your Journey with NexGen</h2>
                <p className="text-lg mb-6">Learn from experts. Train with real equipment. Succeed in the real world.</p>
                <a
                    href="/register"
                    className="bg-white text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                >
                    Register Now
                </a>
            </section>
        </main>
    );
}
