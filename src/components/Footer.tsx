import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-8 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">NexGen Flow & Power</h3>
                    <p className="text-sm">Empowering the next generation in Electrical, Plumbing, and Solar installations.</p>
                </div>

                <div>
                    <h4 className="text-md font-semibold mb-2">Quick Links</h4>
                    <ul className="space-y-1 text-sm">
                        <li><Link href="/about" className="hover:underline">About Us</Link></li>
                        <li><Link href="/training" className="hover:underline">Training</Link></li>
                        <li><Link href="/gallery" className="hover:underline">Gallery</Link></li>
                        <li><Link href="/register" className="hover:underline">Register</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-md font-semibold mb-2">Contact Us</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><FaEnvelope /> nexgenpower@gmail.com</li>
                        <li className="flex items-center gap-2"><FaFacebookF /> <a href="#" target="_blank" className="hover:underline">Facebook</a></li>
                        <li className="flex items-center gap-2"><FaInstagram /> <a href="#" target="_blank" className="hover:underline">Instagram</a></li>
                    </ul>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-6">
                &copy; {new Date().getFullYear()} NexGen Flow & Power. All rights reserved.
            </div>
        </footer>
    );
}
