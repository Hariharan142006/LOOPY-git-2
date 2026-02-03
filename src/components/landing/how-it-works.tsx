"use client";

import { motion } from "framer-motion";
import { Smartphone, Truck, Scale, Wallet } from "lucide-react";

const steps = [
    {
        icon: Smartphone,
        title: "Book a Pickup",
        description: "Schedule a pickup at your convenience via our app or website.",
    },
    {
        icon: Truck,
        title: "We Come to You",
        description: "Our verified agents arrive at your doorstep on time.",
    },
    {
        icon: Scale,
        title: "Accurate Weighing",
        description: "We use ISO-certified digital scales for precise measurement.",
    },
    {
        icon: Wallet,
        title: "Instant Payment",
        description: "Get paid immediately via UPI or Cash before we leave.",
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 bg-black relative border-t border-white/5">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                        How It Works
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Recycling with Loopy is simple, transparent, and rewarding.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-24 w-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 group-hover:border-green-500/50 group-hover:bg-green-500/10 transition-colors">
                                    <step.icon className="h-10 w-10 text-green-500" />
                                </div>
                                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-green-600 text-black font-bold flex items-center justify-center border-4 border-black z-20">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed px-4">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
