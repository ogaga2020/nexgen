'use client';

import Image from 'next/image';

export default function AboutPage() {
    return (
        <main className="font-ui">
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">About NexGen Flow & Power</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">
                    We’re not just training people — we’re building a future workforce of skilled professionals.
                </p>
            </section>

            <section className="py-16 px-6 bg-white max-w-5xl mx-auto">
                <h2 className="text-3xl font-semibold text-primary mb-6">Who We Are</h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                    NexGen Flow & Power is a technical training hub focused on empowering individuals with in-demand
                    skills in Electrical Installation, Plumbing Systems, and Solar Energy Technologies. Based on years
                    of real-world experience, our mission is simple: to raise a new wave of professionals who are
                    practical, competent, and ready to deliver.
                </p>

                <h2 className="text-2xl font-semibold text-primary mb-4">What Makes Us Different?</h2>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                    <li>Modern curriculum aligned with industry demands</li>
                    <li>Hands-on, workshop-based training sessions</li>
                    <li>Mentorship, job referrals, and startup guidance</li>
                    <li>Affordable pricing with flexible installment plans</li>
                </ul>
            </section>

            <section className="bg-graybase py-16 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-primary mb-4">Our Vision</h2>
                        <p className="text-gray-700">
                            To become the go-to platform for skill acquisition and professional training across Africa.
                            We aim to bridge the gap between talent and opportunity by equipping individuals with the
                            right tools to thrive.
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
                <h2 className="text-2xl font-semibold text-primary mb-6">Meet the Instructors</h2>
                <p className="text-gray-700 max-w-xl mx-auto mb-10">
                    Our trainers are certified professionals with years of experience in the field. Their approach is
                    simple — teach what works, guide with real examples, and ensure no one is left behind.
                </p>
                <p className="text-sm text-gray-500 italic">Instructor profiles coming soon...</p>
            </section>
        </main>
    );
}
