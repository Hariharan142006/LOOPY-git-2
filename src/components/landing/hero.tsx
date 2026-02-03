"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-50">
                <Antigravity
                    count={300}
                    magnetRadius={6}
                    ringRadius={8}
                    waveSpeed={0.4}
                    waveAmplitude={1.6}
                    particleSize={1.5}
                    lerpSpeed={0.06}
                    color="#12af42"
                    autoAnimate
                    particleVariance={1}
                    rotationSpeed={0}
                    depthFactor={1}
                    pulseSpeed={3}
                    particleShape="sphere"
                    fieldStrength={10}
                />
            </div>

            <motion.div
                className="relative z-10 max-w-5xl space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400 backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    #1 Scrap Collection Platform
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-6xl font-extrabold tracking-tight sm:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    Turn Waste Into <br />
                    <span className="text-green-500">Wealth Instantly.</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed">
                    The smartest way to recycle. We bring professional agents to your doorstep, weigh accurately with digital scales, and payout instantly.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-6 sm:flex-row pt-4">
                    <Link href="/login">
                        <Button size="lg" className="h-14 min-w-[200px] rounded-full bg-green-600 px-8 text-lg font-bold hover:bg-green-500 text-black shadow-lg shadow-green-900/20 transition-all hover:scale-105">
                            Book a Pickup <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/rates">
                        <Button size="lg" variant="outline" className="h-14 min-w-[200px] rounded-full border-white/10 bg-white/5 px-8 text-lg text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all">
                            Check Today's Rates
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
