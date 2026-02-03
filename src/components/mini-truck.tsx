import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MiniTruckProps {
    className?: string;
    wheelRotation?: number; // In degrees
    isMoving?: boolean;
}

export const MiniTruck = ({ className, wheelRotation = 0, isMoving = false }: MiniTruckProps) => {
    // Animation definition for spinning wheels
    const spinTransition = {
        repeat: Infinity,
        ease: "linear",
        duration: 1 // 1 second per full rotation
    } as const;

    return (
        <div className={cn("relative z-30 transform scale-75 select-none pointer-events-none", className)}>
            <div className="relative flex items-end">

                {/* Truck Cargo Body */}
                <div className="relative w-40 h-24 bg-white border-[3px] border-[#00b355] rounded-l-xl rounded-r-md flex items-center justify-center z-20 shadow-sm overflow-hidden">

                    {/* Text */}
                    <span className="text-[#008f43] font-bold text-xl tracking-wide italic z-10" style={{ fontFamily: 'sans-serif' }}>LOOPY</span>

                    {/* Vertical Indentation Lines */}
                    <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-gray-100 rounded-full"></div>
                    <div className="absolute right-8 top-2 bottom-2 w-[2px] bg-gray-100 rounded-full"></div>
                </div>

                {/* Truck Cab */}
                <div className="relative w-16 h-24 ml-[-6px] z-10 mb-[0px] flex flex-col justify-end">
                    {/* Cab Main Shape */}
                    <div className="w-full h-22 bg-[#009e4b] rounded-tr-[24px] rounded-br-[12px] relative overflow-hidden border-t-[3px] border-r-[3px] border-[#00b355] border-b-0 border-l-0">
                        {/* Window */}
                        <div className="absolute top-[6px] right-[4px] left-[6px] bottom-[36px] bg-gradient-to-b from-[#a7f3d0] to-[#6ee7b7] rounded-tr-[16px] rounded-bl-[4px] border border-[#059669]/30">
                            <div className="w-full h-full opacity-50 bg-gradient-to-tr from-transparent to-white/40"></div>
                        </div>
                        {/* Fender */}
                        <div className="absolute bottom-0 left-0 right-0 h-[28px] bg-[#007f3b]"></div>
                        {/* Headlight */}
                        <div className="absolute bottom-[12px] right-[2px] w-2 h-3 rounded-sm bg-yellow-100"></div>
                    </div>
                </div>

                {/* Wheels */}
                <div className="absolute -bottom-5 left-6 z-30">
                    <motion.div
                        className="w-12 h-12 rounded-full bg-[#2d333f] border-[3px] border-white/20 flex items-center justify-center shadow-lg"
                        style={{ rotate: wheelRotation }} // Use style rotate for manual control
                        animate={isMoving ? { rotate: 360 } : {}}
                        transition={isMoving ? spinTransition : {}}
                    >
                        <div className="w-5 h-5 rounded-full bg-[#9ca3af] border border-gray-600 relative">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-700/50 -translate-y-1/2"></div>
                            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gray-700/50 -translate-x-1/2"></div>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute -bottom-5 left-[125px] z-30">
                    <motion.div
                        className="w-12 h-12 rounded-full bg-[#2d333f] border-[3px] border-white/20 flex items-center justify-center shadow-lg"
                        style={{ rotate: wheelRotation }}
                        animate={isMoving ? { rotate: 360 } : {}}
                        transition={isMoving ? spinTransition : {}}
                    >
                        <div className="w-5 h-5 rounded-full bg-[#9ca3af] border border-gray-600 relative">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-700/50 -translate-y-1/2"></div>
                            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gray-700/50 -translate-x-1/2"></div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};
