"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Leaf, Clock, TrendingUp } from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        title: "Trusted Agents",
        description: "Every agent is background-verified and professionally trained.",
    },
    {
        icon: Leaf,
        title: "Eco-Friendly",
        description: "We ensure 100% of collected scrap is recycled responsibly.",
    },
    {
        icon: Clock,
        title: "On-Demand",
        description: "Book a pickup for now or schedule it for later. Your choice.",
    },
    {
        icon: TrendingUp,
        title: "Best Rates",
        description: "Our dynamic pricing engine ensures you get the best market rates.",
    },
];

export function WhyScrapFlow() {
    return (
        <section className="py-24 bg-neutral-900/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                            Why Choose <span className="text-green-500">ScrapFlow</span>?
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            We are revolutionizing the scrap industry by bringing transparency, technology, and trust to a traditionally unorganized sector.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                            <feature.icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                                        <p className="text-sm text-gray-400">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 ">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 mix-blend-overlay" />
                            {/* Placeholder for an illustrative image or 3D element */}
                            <div className="flex items-center justify-center h-full text-white/20">
                                <Leaf className="h-32 w-32" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
