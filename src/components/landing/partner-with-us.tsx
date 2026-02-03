"use client";

import { motion } from "framer-motion";
import { Handshake, Store, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PartnerWithUs() {
    return (
        <section className="py-24 bg-neutral-900 border-t border-white/5">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-white text-center mb-16">Partner With Us</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-black border border-white/10 hover:border-green-500/30 transition-all"
                    >
                        <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                            <Handshake className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Become a Franchisee</h3>
                        <p className="text-gray-400 mb-6">
                            Start your own profitable scrap collection business with Loopy's technology and brand support. Low investment, high returns.
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">Apply for Franchise</Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-black border border-white/10 hover:border-green-500/30 transition-all"
                    >
                        <div className="h-12 w-12 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
                            <Store className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Retail Partners</h3>
                        <p className="text-gray-400 mb-6">
                            Local scrap dealers (Kabadiwalas) can join our network to get consistent volume and digital payments.
                        </p>
                        <Button className="w-full bg-green-600 hover:bg-green-500 text-black font-bold">Join as Partner</Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
