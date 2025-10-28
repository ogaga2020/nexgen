import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-6">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-white to-white/70 p-1 ring-1 ring-white/40 shadow-lg shadow-white/10">
                                <Image
                                    src="/logo2.jpg"
                                    alt="Ogaga-Enterprise logo"
                                    width={40}
                                    height={40}
                                    priority
                                    className="h-10 w-10 rounded-full object-cover brightness-110 contrast-125"
                                />
                            </span>
                            <span className="text-xl font-bold">Ogaga-Enterprise</span>
                        </Link>
                        <p className="mt-2 text-sm text-gray-300">
                            Empowering the next generation in Electrical, Plumbing, and Solar installations.
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                            <a
                                href="mailto:ogagaenterprise@gmail.com"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                                aria-label="Email"
                            >
                                <FaEnvelope />
                            </a>
                            <a
                                href="https://www.instagram.com/ogaga_enterprise?igsh=azN6eTltcXNhZ2U1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                                aria-label="Instagram"
                            >
                                <FaInstagram />
                            </a>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Quick Links</h4>
                        <nav className="mt-3 ">
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/about" className="hover:underline">About Us</Link></li>
                                <li><Link href="/training" className="hover:underline">Training</Link></li>
                                <li><Link href="/gallery" className="hover:underline">Gallery</Link></li>
                                <li><Link href="/register" className="hover:underline">Register</Link></li>
                            </ul>
                        </nav>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Contact</h4>
                        <ul className="mt-3 space-y-1.5 text-sm">
                            <li className="flex items-center gap-2">
                                <FaEnvelope className="shrink-0" />
                                <a href="mailto:ogagaenterprise@gmail.com" className="hover:underline">
                                    ogagaenterprise@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <FaMapMarkerAlt className="shrink-0 mt-0.5" />
                                <span>16, Augustine Okoh Street,<br />Okuokoko.</span>
                            </li>
                            <li className="text-gray-400">Mon–Fri, 9:00am–5:00pm</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-400">
                    &copy; {year} Ogaga-Enterprise. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
