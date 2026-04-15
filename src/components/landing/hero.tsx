"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Antigravity from "@/components/antigravity";

export function Hero() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center py-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Antigravity
                    count={200}
                    magnetRadius={8}
                    ringRadius={10}
                    waveSpeed={0.3}
                    waveAmplitude={1.2}
                    particleSize={1.2}
                    lerpSpeed={0.04}
                    color="#22c55e"
                    autoAnimate
                    particleVariance={1.5}
                    rotationSpeed={0.01}
                    depthFactor={1.2}
                    pulseSpeed={2}
                    particleShape="sphere"
                    fieldStrength={8}
                />
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                className="relative z-10 max-w-5xl space-y-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div 
                    variants={itemVariants} 
                    className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs md:text-sm font-bold text-green-400 backdrop-blur-md"
                >
                    <Sparkles size={14} className="animate-pulse" />
                    <span>#1 Scrap Collection Platform in India</span>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                            Scrap to
                        </span>
                        <br />
                        <span className="text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            Wealth.
                        </span>
                    </h1>
                </motion.div>

                <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl font-medium leading-relaxed">
                    Doorstep pickup. Certified digital weighing. <br className="hidden md:block" />
                    <span className="text-white">Instant payment</span> to your bank account.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-6">
                    <Link href="/signup">
                        <Button size="lg" className="h-16 px-10 rounded-2xl bg-green-600 text-lg font-black hover:bg-green-500 text-black shadow-2xl shadow-green-900/40 transition-all hover:scale-105 active:scale-95 group">
                            Start Recycling Now
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Link href="/rates">
                        <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-lg font-bold text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                            View Today's Rates
                        </Button>
                    </Link>
                </motion.div>
                
                {/* Trust badges */}
                <motion.div 
                    variants={itemVariants}
                    className="pt-12 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
                >
                    {["ISO Certified", "Eco Friendly", "Instant Payout", "Verified Agents"].map(t => (
                        <span key={t} className="text-xs font-black uppercase tracking-[0.2em] text-white/50">{t}</span>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
