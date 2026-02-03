"use client";

import { motion } from "framer-motion";
import { Trees, Droplets, Zap, Wind } from "lucide-react";

const stats = [
    { icon: Trees, value: "15,000+", label: "Trees Saved", color: "text-green-500" },
    { icon: Wind, value: "2,500T", label: "CO2 Reduced", color: "text-sky-400" },
    { icon: Droplets, value: "450M L", label: "Water Saved", color: "text-blue-500" },
    { icon: Zap, value: "8,000MW", label: "Energy Conserved", color: "text-yellow-400" },
];

export function ImpactAwareness() {
    return (
        <section className="py-32 relative bg-black">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-extrabold tracking-tight text-white mb-6"
                    >
                        Your Impact Matters
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400 leading-relaxed"
                    >
                        Every kilogram of scrap you sell to us is recycled responsibly, directly contributing to a cleaner, greener earth. Here is what our community has achieved so far.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm"
                        >
                            <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm font-medium text-gray-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
