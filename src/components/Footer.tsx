import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-6">
                        <h3 className="text-xl font-bold">NexGen Flow & Power</h3>
                        <p className="mt-2 text-sm text-gray-300">
                            Empowering the next generation in Electrical, Plumbing, and Solar installations.
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                            <a
                                href="mailto:nexgenpower@gmail.com"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                                aria-label="Email"
                            >
                                <FaEnvelope />
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                                aria-label="Facebook"
                            >
                                <FaFacebookF />
                            </a>
                            <a
                                href="#"
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
                                <a href="mailto:nexgenpower@gmail.com" className="hover:underline">
                                    nexgenpower@gmail.com
                                </a>
                            </li>
                            <li className="text-gray-400">Mon–Fri, 9:00am–5:00pm</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-400">
                    &copy; {year} NexGen Flow & Power. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
