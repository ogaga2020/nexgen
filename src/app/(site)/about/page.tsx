import Image from 'next/image';
import Link from 'next/link';

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

            <section className="bg-gray-50 px-6 py-12 md:py-16">
                <div className="mx-auto max-w-6xl grid items-center gap-8 md:grid-cols-2 md:gap-12">
                    <div>
                        <h2 className="text-3xl font-semibold text-primary mb-4">Our Vision</h2>
                        <p className="text-gray-700 leading-relaxed">
                            To become Africa’s go-to platform for skill acquisition and professional training.
                            We aim to bridge the gap between talent and opportunity, ensuring our graduates
                            are fully equipped to thrive in their chosen fields.
                        </p>
                    </div>
                    <div className="md:order-last">
                        <img
                            src="https://t3.ftcdn.net/jpg/01/05/11/04/360_F_105110489_PQGeKf7q24LfRJMt3c1iNaLmeSeFZZHo.jpg"
                            alt="NexGen mission, vision and values"
                            loading="lazy"
                            className="w-full max-w-xl mx-auto md:ml-auto rounded-xl shadow-md ring-1 ring-black/5 object-cover"
                        />
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-white">
                <h2 className="text-3xl font-semibold text-primary text-center mb-8">
                    Meet the Instructors
                </h2>

                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
                        <img
                            src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                            alt="Instructor avatar"
                            className="w-24 h-24 rounded-full object-cover mx-auto border"
                        />
                        <h3 className="mt-4 text-lg font-semibold">Mr. Chidi Okafor</h3>
                        <p className="mt-1 text-sm text-gray-600">Electrical • Solar</p>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
                        <img
                            src="https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517431_640.png"
                            alt="Instructor avatar"
                            className="w-24 h-24 rounded-full object-cover mx-auto border"
                        />
                        <h3 className="mt-4 text-lg font-semibold">Engr. Amaka Udu</h3>
                        <p className="mt-1 text-sm text-gray-600">Plumbing</p>
                    </div>
                </div>
            </section>

            <section className="bg-blue-900 text-white py-20 px-4 text-center">
                <h2 className="text-3xl font-semibold mb-4">Start Your Journey with NexGen</h2>
                <p className="text-lg mb-6">Learn from experts. Train with real equipment. Succeed in the real world.</p>
                <Link
                    href="/register"
                    className="inline-block bg-white text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                >
                    Register Now
                </Link>
            </section>
        </main>
    );
}
