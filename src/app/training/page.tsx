'use client';

import { useRouter } from 'next/navigation';

export default function TrainingDetailsPage() {
    const router = useRouter();

    return (
        <div className="font-ui">
            <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4 py-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Training Program Details</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">Comprehensive, real-world training to prepare you for success in Electrical, Solar, and Plumbing systems.</p>
            </section>

            <section className="py-16 px-4 bg-white">
                <h2 className="text-3xl font-semibold text-center text-primary mb-8">Electrical Installation</h2>
                <div className="max-w-5xl mx-auto text-gray-700 space-y-6 text-center md:text-left">
                    <p>
                        Our Electrical Installation training equips you with the skills to plan, size, and implement inverter-based systems for residential and light commercial use.
                    </p>
                    <p>You’ll gain practical understanding of:</p>
                    <ul className="list-disc list-inside text-left space-y-2">
                        <li>How to determine energy load requirements</li>
                        <li>Battery and inverter sizing based on real-world applications</li>
                        <li>Solar panel configuration and mounting principles</li>
                        <li>Safe installation practices and compliance standards</li>
                        <li>Efficient power distribution and system optimization</li>
                    </ul>
                    <p className="pt-6 font-medium">
                        By the end of the training, you’ll be able to confidently evaluate and build setups for homes, small offices, and commercial spaces.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 bg-gray-50">
                <h2 className="text-3xl font-semibold text-center text-primary mb-8">Solar Energy Training</h2>
                <div className="max-w-5xl mx-auto text-gray-700 space-y-6">
                    <p>Our solar energy track focuses on the design, installation, and maintenance of solar systems for homes and businesses.</p>
                    <ul className="list-disc pl-6">
                        <li>Introduction to solar technologies (PV, hybrid, off-grid)</li>
                        <li>Solar panel orientation, sizing, and tilt configuration</li>
                        <li>Battery types and energy storage systems</li>
                        <li>Inverter and charge controller setup</li>
                        <li>Wiring, safety, and local regulation compliance</li>
                        <li>Installation techniques for rooftops and ground mounts</li>
                        <li>Troubleshooting and maintenance of solar systems</li>
                        <li>Hands-on live installations and simulations</li>
                    </ul>
                </div>
            </section>

            <section className="py-16 px-4 bg-white">
                <h2 className="text-3xl font-semibold text-center text-primary mb-8">Plumbing Systems Training</h2>
                <div className="max-w-5xl mx-auto text-gray-700 space-y-6">
                    <p>Gain solid skills in both residential and commercial plumbing. Our program includes:</p>
                    <ul className="list-disc pl-6">
                        <li>Understanding water systems and sanitation</li>
                        <li>Pipe fitting (PVC, PPR, copper, iron, etc.)</li>
                        <li>Installation of toilets, faucets, sinks, showers, and heaters</li>
                        <li>Leak detection, repair, and soldering techniques</li>
                        <li>Pressure testing and troubleshooting</li>
                        <li>Drainage systems and septic setup</li>
                        <li>Building code compliance and plumbing safety</li>
                        <li>Practical on-site training sessions</li>
                    </ul>
                </div>
            </section>

            <section className="bg-blue-900 text-white py-20 px-4 text-center">
                <h2 className="text-3xl font-semibold mb-4">Ready to Join a Training Program?</h2>
                <p className="text-lg mb-6">Apply now and start learning hands-on skills with NexGen experts.</p>
                <button
                    onClick={() => router.push('/register')}
                    className="bg-white text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                >
                    Apply Now
                </button>
            </section>
        </div>
    );
}
