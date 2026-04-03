'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Package, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/pricing';
import { SwipeButton } from './swipe-button';
import { assignAgentToBookingAction } from '@/app/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IncomingOrderModalProps {
    booking: any;
    agentId: string;
    onAccept: () => void;
    onReject: (bookingId: string) => void;
}

export function IncomingOrderModal({ booking, agentId, onAccept, onReject }: IncomingOrderModalProps) {
    const [timeLeft, setTimeLeft] = useState(30);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        if (!booking) return;

        if (timeLeft <= 0) {
            onReject(booking.id);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, booking?.id, onReject]);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const res = await assignAgentToBookingAction(booking.id, agentId);
            if (res.success) {
                toast.success('Pickup Accepted!');
                onAccept();
            } else {
                toast.error(res.error || 'Failed to accept pickup');
                onReject(booking.id); // dismiss if someone else took it
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
            setIsAccepting(false);
            // reset drag button inside swipe button but we just let it fail or handled by SwipeButton
            throw error;
        }
    };

    if (!booking) return null;

    const itemsText = booking.items?.map((bi: any) => bi.item?.name || 'Item').join(', ') || 'Various Items';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] flex flex-col items-center justify-end bg-black/60 backdrop-blur-md p-4 sm:p-6"
            >
                {/* Audio notification illusion using pulsing UI */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-x-0 top-1/4 flex flex-col items-center pointer-events-none"
                >
                    <div className="h-32 w-32 bg-green-500/20 rounded-full flex items-center justify-center -mb-16 animate-ping absolute top-0 z-0"></div>
                    <div className="h-24 w-24 bg-green-500/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(34,197,94,0.6)] z-10 relative">
                        <Package className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="mt-8 text-3xl font-black text-white tracking-tight drop-shadow-md z-20">
                        NEW PICKUP
                    </h2>
                    <p className="text-green-300 font-bold mt-1 text-lg z-20">
                        Swipe to Accept!
                    </p>
                </motion.div>

                {/* Bottom Sheet Card */}
                <motion.div
                    initial={{ y: 400, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 400, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                >
                    {/* Timer Bar */}
                    <div className="w-full h-1.5 bg-gray-100 flex justify-end">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${(timeLeft / 30) * 100}%` }}
                            transition={{ duration: 1, ease: 'linear' }}
                            className={cn("h-full self-start", timeLeft > 10 ? "bg-green-500" : "bg-red-500")}
                            style={{ transformOrigin: 'left' }}
                        />
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Estimated Value</h3>
                                <div className="text-3xl font-black text-gray-900">
                                    {formatCurrency(booking.totalAmount)}
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Distance</h3>
                                <div className="text-xl font-bold text-blue-600">
                                    {booking.distance !== undefined ?
                                        (booking.distance < 1 ? `${(booking.distance * 1000).toFixed(0)}m` : `${booking.distance.toFixed(1)}km`)
                                        : 'Nearby'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-gray-900 truncate">{booking.user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{booking.address?.street}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <Package className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-gray-900 truncate">Items Expected</p>
                                    <p className="text-xs text-gray-500 truncate">{itemsText}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SwipeButton
                                onComplete={handleAccept}
                                text="SWIPE TO ACCEPT"
                                completedText="ACCEPTED"
                                isOnline={false} // Forces the green gradient variant
                                isLoading={isAccepting}
                                className="h-14 sm:h-16"
                            />

                            <Button
                                variant="ghost"
                                className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onReject(booking.id)}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Reject & Pass to Next Agent
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
