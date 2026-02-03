"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from 'react';
import { MiniTruck } from "../mini-truck";
import { motion } from "framer-motion";

export function MovingTruckBanner() {
    const [time, setTime] = React.useState<Date | null>(null);

    // Update time every minute
    React.useEffect(() => {
        setTime(new Date());
        const interval = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    if (!time) return null; // Prevent hydration mismatch

    const hours = time.getHours();

    // Determine Phase & Background Gradient
    // Dawn: 5-7, Day: 7-17, Dusk: 17-20, Night: 20-5
    let phase = 'night';
    let gradient = 'bg-gradient-to-b from-[#0f172a] to-[#1e293b]'; // Default Night

    if (hours >= 5 && hours < 7) {
        phase = 'dawn';
        gradient = 'bg-gradient-to-b from-indigo-400 via-purple-300 to-orange-200';
    } else if (hours >= 7 && hours < 17) {
        phase = 'day';
        gradient = 'bg-gradient-to-b from-sky-400 to-sky-100';
    } else if (hours >= 17 && hours < 20) {
        phase = 'dusk';
        gradient = 'bg-gradient-to-b from-slate-800 via-purple-900 to-orange-500';
    }

    const isNight = phase === 'night';
    const isDay = phase === 'day';

    // Calculate Celestial Position (Sun/Moon cycle across screen)
    // Map 24h to percentage. 
    // Day cycle: 06:00 (left) -> 18:00 (right)
    // Night cycle: 18:00 (left) -> 06:00 (right)
    let celestialProgress = 0;
    if (hours >= 6 && hours < 18) {
        celestialProgress = ((hours - 6) / 12) * 100;
    } else {
        let adjustedHour = hours >= 18 ? hours - 18 : hours + 6;
        celestialProgress = (adjustedHour / 12) * 100;
    }

    // Initial random positions for stars
    const stars = [
        { top: '10%', left: '20%', delay: '0s' },
        { top: '15%', left: '80%', delay: '1s' },
        { top: '5%', left: '50%', delay: '2s' },
        { top: '25%', left: '10%', delay: '0.5s' },
        { top: '20%', left: '90%', delay: '1.5s' },
        { top: '8%', left: '30%', delay: '2.5s' },
    ];

    // Additional stars for more density
    const moreStars = [
        { top: '12%', left: '15%', delay: '0.3s', size: 'w-1 h-1' },
        { top: '18%', left: '60%', delay: '1.2s', size: 'w-0.5 h-0.5' },
        { top: '6%', left: '75%', delay: '2.2s', size: 'w-1 h-1' },
        { top: '22%', left: '40%', delay: '0.8s', size: 'w-0.5 h-0.5' },
        { top: '14%', left: '85%', delay: '1.8s', size: 'w-1.5 h-1.5' },
        { top: '4%', left: '25%', delay: '2.8s', size: 'w-0.5 h-0.5' },
        { top: '20%', left: '55%', delay: '0.2s', size: 'w-1 h-1' },
        { top: '8%', left: '65%', delay: '1.5s', size: 'w-0.5 h-0.5' },
        { top: '16%', left: '5%', delay: '2.1s', size: 'w-1 h-1' },
    ];

    // Clouds positions and sizes
    const clouds = [
        { top: '15%', left: '10%', width: 'w-24', opacity: isDay ? 'opacity-60' : 'opacity-20' },
        { top: '25%', left: '70%', width: 'w-32', opacity: isDay ? 'opacity-40' : 'opacity-15' },
        { top: '8%', left: '45%', width: 'w-20', opacity: isDay ? 'opacity-50' : 'opacity-10' },
    ];

    return (
        <div className={`lg:col-span-2 relative overflow-hidden rounded-3xl border border-gray-100 flex flex-col items-center justify-start min-h-[320px] shadow-sm group transition-colors duration-1000 ${gradient}`}>

            {/* Atmospheric Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {isDay && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/20"></div>
                )}
                {isNight && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-slate-900/40"></div>
                )}
            </div>

            {/* Celestial Body (Sun/Moon) */}
            <div
                className="absolute top-10 w-16 h-16 rounded-full transition-all duration-1000 ease-linear shadow-lg z-0"
                style={{
                    left: `${celestialProgress}%`,
                    background: isNight ? '#fefce8' : '#fcd34d', // Moon white-yellow, Sun yellow
                    boxShadow: isNight ? '0 0 20px 5px rgba(254, 252, 232, 0.4)' : '0 0 40px 10px rgba(252, 211, 77, 0.6)'
                }}
            >
                {isNight && <div className="absolute top-2 left-3 w-4 h-4 bg-gray-200/40 rounded-full"></div>}
                {/* Sun rays */}
                {isDay && (
                    <>
                        <div className="absolute inset-0 rounded-full animate-pulse opacity-30 bg-yellow-300"></div>
                        <div className="absolute -inset-2 rounded-full opacity-20 bg-gradient-radial from-yellow-200 to-transparent"></div>
                    </>
                )}
            </div>

            {/* Clouds */}
            {clouds.map((cloud, i) => (
                <div
                    key={`cloud-${i}`}
                    className={`absolute ${cloud.top} ${cloud.width} h-8 ${cloud.opacity} transition-opacity duration-1000 pointer-events-none`}
                    style={{ left: cloud.left }}
                >
                    {/* Cloud shape using multiple rounded divs */}
                    <div className="relative w-full h-full">
                        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full ${isNight ? 'bg-slate-700/40' : 'bg-white/80'}`}></div>
                        <div className={`absolute top-0 left-6 w-8 h-8 rounded-full ${isNight ? 'bg-slate-700/40' : 'bg-white/80'}`}></div>
                        <div className={`absolute top-1 left-12 w-7 h-7 rounded-full ${isNight ? 'bg-slate-700/40' : 'bg-white/80'}`}></div>
                        <div className={`absolute top-3 left-4 w-12 h-4 rounded-full ${isNight ? 'bg-slate-700/30' : 'bg-white/70'}`}></div>
                    </div>
                </div>
            ))}

            {/* Stars (Night Only) - Original set */}
            {isNight && stars.map((star, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                    style={{ top: star.top, left: star.left, animationDelay: star.delay }}
                ></div>
            ))}

            {/* Additional Stars (Night Only) - More variety */}
            {isNight && moreStars.map((star, i) => (
                <div
                    key={`star-${i}`}
                    className={`absolute ${star.size} bg-white rounded-full animate-twinkle`}
                    style={{ top: star.top, left: star.left, animationDelay: star.delay }}
                ></div>
            ))}

            {/* Content Text & Button */}
            <div className="z-20 text-center mt-8 space-y-5 flex flex-col items-center justify-center h-full pb-20">
                <Link href="/book">
                    <Button size="lg" className={`animate-bounce font-bold h-12 px-8 rounded-full shadow-lg transition-all text-base ${isNight ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 text-white' : 'bg-[#00b355] hover:bg-[#009e4b] shadow-green-500/25 text-white'}`}>
                        Book Pickup Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                <p className={`font-medium tracking-normal text-sm ${isNight ? 'text-gray-300' : 'text-gray-500'}`}>Ready to recycle? Schedule a pickup instantly.</p>
            </div>

            {/* Road & Moving Truck Container */}
            <div className="absolute bottom-0 left-0 right-0 h-[70px] w-full z-10">

                {/* Road Top Border/Curb */}
                <div className="absolute top-0 w-full h-3 bg-[#4b5563] z-10"></div>

                {/* Main Road Surface */}
                <div className="absolute top-3 bottom-0 w-full bg-[#374151] flex items-center justify-center overflow-hidden">
                    {/* Dashed Line - Yellow, wider dashes */}
                    <div className="w-full h-[4px] flex justify-between gap-12 px-0 opacity-90">
                        {/* Repeating gradient for evenly spaced dashes with animation */}
                        <div className="w-[200%] h-full animate-drive-road" style={{ background: 'repeating-linear-gradient(90deg, #ca8a04 0, #ca8a04 50px, transparent 50px, transparent 100px)' }}></div>
                    </div>
                </div>

                {/* Truck Animation Wrapper */}
                <motion.div
                    className="absolute bottom-7 z-30"
                    initial={{ left: "-20%" }}
                    animate={{ left: "120%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 5,
                        ease: "linear",
                    }}
                >
                    <MiniTruck className="transform scale-75 origin-bottom" wheelRotation={0} isMoving={true} />
                </motion.div>
            </div>

        </div>
    );
}
