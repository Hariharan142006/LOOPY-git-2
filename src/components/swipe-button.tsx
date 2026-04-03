'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { ChevronRight, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeButtonProps {
    onComplete: () => Promise<void>;
    text?: string;
    completedText?: string;
    className?: string;
    isOnline?: boolean;
    isLoading?: boolean;
}

export const SwipeButton = ({
    onComplete,
    text = 'SWIPE TO GO ONLINE',
    completedText = 'ONLINE',
    className,
    isOnline = false,
    isLoading = false
}: SwipeButtonProps) => {
    const [dragX, setDragX] = useState(0);
    const [completed, setCompleted] = useState(false);
    const controls = useAnimation();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Padding inside the track for the handle
    const padding = 6;
    // Size of the draggable handle
    const handleSize = 48;

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }

        // Reset state if online status changes externally
        if (completed && !isOnline && isLoading === false) {
            setCompleted(false);
            setDragX(0);
            controls.start({ x: 0 });
        }
    }, [containerRef.current, isOnline, isLoading]);

    const maxDrag = Math.max(0, containerWidth - handleSize - (padding * 2));
    const threshold = maxDrag * 0.85; // 85% threshold to complete

    const handleDrag = (_: any, info: PanInfo) => {
        if (completed || isLoading) return;
        const newX = Math.min(Math.max(0, info.offset.x), maxDrag);
        setDragX(newX);
    };

    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (completed || isLoading) return;

        if (dragX >= threshold) {
            setDragX(maxDrag);
            // Snap to end with a satisfying spring
            controls.start({
                x: maxDrag,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            });
            setCompleted(true);
            try {
                await onComplete();
                // Optionally auto-reset after completion if it's meant to be reused immediately
                // but usually, state changes and unmounts/remounts or changes props.
            } catch (e) {
                // Reset if failed
                setCompleted(false);
                setDragX(0);
                controls.start({
                    x: 0,
                    transition: { type: "spring", stiffness: 300, damping: 25 }
                });
            }
        } else {
            // Snap back if threshold not met
            setDragX(0);
            controls.start({
                x: 0,
                transition: { type: "spring", stiffness: 300, damping: 25 }
            });
        }
    };

    const isGoOnline = !isOnline;

    // Premium styling variants
    const trackBgColor = isGoOnline ? 'bg-gray-100/80 border-gray-200/50' : 'bg-red-50/80 border-red-100/50';
    const fillGradient = isGoOnline
        ? 'bg-gradient-to-r from-green-400 to-green-500' // Gorgeous green gradient for online
        : 'bg-gradient-to-r from-red-400 to-red-500';    // Red gradient for offline
    const textColor = isGoOnline ? 'text-gray-500' : 'text-gray-600';

    // Text fading effect as you drag
    const textOpacity = containerWidth > 0 ? Math.max(0, 1 - (dragX / (containerWidth * 0.4))) : 1;

    // Spring physics configuration
    const springConfig = { type: "spring", stiffness: 400, damping: 30 };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative h-16 rounded-full overflow-hidden select-none touch-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] transition-colors duration-300 border backdrop-blur-sm",
                trackBgColor,
                className
            )}
        >
            {/* Background Fill Track */}
            <motion.div
                className={cn("absolute top-0 left-0 h-full flex items-center shadow-inner rounded-full shadow-md", fillGradient)}
                style={{ width: dragX + handleSize + (padding * 2) }}
            >
            </motion.div>

            {/* Instruction Text */}
            <div
                className={cn(
                    "absolute inset-0 flex items-center justify-center text-[13px] sm:text-[13px] font-bold tracking-[0.15em] pointer-events-none z-20 transition-opacity duration-200 uppercase",
                    textColor
                )}
                style={{ opacity: isLoading ? 1 : textOpacity }}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2 text-white drop-shadow-sm font-semibold tracking-wider">
                        <Loader2 className="h-4 w-4 animate-spin text-white/90" /> PROCESSING...
                    </span>
                ) : completed ? (
                    <span className="text-white drop-shadow-sm font-bold tracking-wider">{completedText}</span>
                ) : (
                    <span className={cn(
                        "flex items-center gap-2 whitespace-nowrap px-12",
                        // Subtle shimmer effect only when not dragged
                        dragX === 0 && !completed && !isLoading ? "animate-pulse opacity-80" : ""
                    )}>
                        {text}
                    </span>
                )}
            </div>

            {/* Draggable Handle */}
            <motion.div
                className={cn(
                    "absolute top-1 bottom-1 left-1 flex items-center justify-center cursor-grab active:cursor-grabbing z-30",
                    "aspect-square rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] bg-white border border-gray-100/80",
                    isLoading || completed ? "pointer-events-none" : ""
                )}
                drag={!isLoading && !completed ? "x" : false}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={controls}
                whileTap={{ scale: 0.95 }}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                {isLoading ? (
                    <Loader2 className={cn("h-5 w-5 animate-spin text-green-500")} />
                ) : completed && !isLoading ? (
                    <Check className="h-6 w-6 text-white bg-green-500 rounded-full p-1" />
                ) : (
                    <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronRight className={cn("h-6 w-6", isGoOnline ? "text-green-500" : "text-red-500")} strokeWidth={3} />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
