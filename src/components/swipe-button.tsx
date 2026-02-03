'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeButtonProps {
    onComplete: () => Promise<void>;
    text?: string;
    completedText?: string;
    className?: string;
    isOnline?: boolean; // To style differently for Online/Offline
    isLoading?: boolean;
}

export const SwipeButton = ({
    onComplete,
    text = 'Swipe to Go Online',
    completedText = 'Online',
    className,
    isOnline = false,
    isLoading = false
}: SwipeButtonProps) => {
    const [dragX, setDragX] = useState(0);
    const [completed, setCompleted] = useState(false);
    const controls = useAnimation();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, [containerRef.current]);

    const handleDrag = (_: any, info: PanInfo) => {
        if (completed || isLoading) return;
        // Limit drag to container width minus handle width (approx 52px)
        const maxDrag = containerWidth - 52;
        const newX = Math.min(Math.max(0, info.offset.x), maxDrag);
        setDragX(newX);
    };

    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (completed || isLoading) return;
        const maxDrag = containerWidth - 52;
        const threshold = maxDrag * 0.9; // 90% threshold

        if (dragX >= threshold) {
            setDragX(maxDrag);
            // Snap to end
            controls.start({ x: maxDrag });
            setCompleted(true);
            try {
                await onComplete();
            } catch (e) {
                // Reset if failed
                setCompleted(false);
                setDragX(0);
                controls.start({ x: 0 });
            }
        } else {
            setDragX(0);
            controls.start({ x: 0 });
        }
    };

    const isGoOnline = !isOnline;

    const bgColor = 'bg-gray-100';
    const activeColor = 'bg-green-600'; // Green for online state
    const textColor = isGoOnline ? 'text-gray-500' : 'text-white';

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative h-14 rounded-xl overflow-visible select-none touch-none shadow-sm transition-colors duration-300 border border-gray-200",
                bgColor,
                className
            )}
        >

            <div className="absolute inset-0 rounded-xl overflow-hidden">
                {/* Background Fill Track */}
                <motion.div
                    className={cn("absolute top-0 left-0 h-full flex items-center overflow-hidden", activeColor)}
                    style={{ width: dragX + 52 }}
                >
                </motion.div>

                {/* Teaching Text */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center text-sm font-bold uppercase tracking-wider pointer-events-none transition-opacity duration-200 z-20",
                    textColor
                )}
                    style={{ opacity: containerWidth > 0 ? Math.max(0, 1 - dragX / (containerWidth * 0.5)) : 1 }}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                        </span>
                    ) : text}
                </div>
            </div>

            {/* Draggable Handle */}
            <motion.div
                className={cn(
                    "absolute left-1 top-1 h-12 w-12 flex items-center justify-center cursor-grab active:cursor-grabbing z-10",
                    "bg-transparent"
                )}
                drag="x"
                dragConstraints={{ left: 0, right: containerWidth - 52 }}
                dragElastic={0.05}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={controls}
                whileTap={{ scale: 1.05 }}
            >
                {isLoading ? (
                    <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center shadow-md">
                        <Loader2 className={cn("h-6 w-6 animate-spin", isGoOnline ? "text-green-600" : "text-gray-600")} />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center shadow-md border border-gray-100">
                        <ChevronRight className={cn("h-6 w-6", isGoOnline ? "text-green-600" : "text-gray-400")} />
                    </div>
                )}
            </motion.div>
        </div>
    );
};
