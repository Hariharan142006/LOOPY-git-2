"use client";

import Link from "next/link";
import { Leaf, Twitter, Instagram, Linkedin, Facebook } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                                <Leaf className="h-5 w-5 text-black fill-current" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter text-white">Loopy</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Transforming the way India recycles. Join the movement towards a zero-waste future.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-green-500/10 hover:text-green-500 text-gray-400 transition-colors">
                                <Twitter className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-green-500/10 hover:text-green-500 text-gray-400 transition-colors">
                                <Instagram className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-green-500/10 hover:text-green-500 text-gray-400 transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-green-500/10 hover:text-green-500 text-gray-400 transition-colors">
                                <Facebook className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-green-500 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-green-500 transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-green-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-green-500 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Services</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-green-500 transition-colors">Scrap Collection</Link></li>
                            <li><Link href="#" className="hover:text-green-500 transition-colors">Corporate Tie-ups</Link></li>
                            <li><Link href="#" className="hover:text-green-500 transition-colors">Rate Card</Link></li>
                            <li><Link href="#" className="hover:text-green-500 transition-colors">Become an Agent</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li>help@loopy.com</li>
                            <li>+91 98765 43210</li>
                            <li>123, Tech Park, Bangalore, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-600">© 2024 Loopy. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-gray-600">
                        <Link href="#">Privacy</Link>
                        <Link href="#">Terms</Link>
                        <Link href="#">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
