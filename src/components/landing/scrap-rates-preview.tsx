"use client";

import { motion } from "framer-motion";
import { ArrowRight, Newspaper, Package, Battery, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const rates = [
    { name: "Newspaper", price: "₹12/kg", icon: Newspaper, color: "text-blue-400" },
    { name: "Cardboard", price: "₹8/kg", icon: Package, color: "text-amber-400" },
    { name: "Iron", price: "₹28/kg", icon: Battery, color: "text-gray-400" },
    { name: "E-Waste", price: "₹45/kg", icon: Zap, color: "text-purple-400" },
];

export function ScrapRatesPreview() {
    return (
        <section className="py-24 bg-black border-y border-white/5">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">
                        Live Scrap Rates
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
                    {rates.map((rate, index) => (
                        <motion.div
                            key={rate.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all group"
                        >
                            <rate.icon className={`h-8 w-8 mx-auto mb-4 ${rate.color}`} />
                            <div className="text-2xl font-bold text-white mb-1">{rate.price}</div>
                            <div className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                {rate.name}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Link href="/rates">
                    <Button variant="outline" className="rounded-full px-8 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300">
                        View All Rates <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
