"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, MapPin, Loader2, XCircle } from "lucide-react";
import { cancelBookingAction } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActivePickupCardProps {
    booking: any;
}

export function ActivePickupCard({ booking }: ActivePickupCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (!booking) return null;

    const handleCancel = async () => {
        setLoading(true);
        try {
            const { success, error } = await cancelBookingAction(booking.id);
            if (success) {
                toast.success("Pickup cancelled successfully");
                window.location.reload(); // Refresh to update dashboard
            } else {
                toast.error(error || "Failed to cancel pickup");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="lg:col-span-2 rounded-3xl border-gray-100 bg-white shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500/20">
                <div className="h-full w-1/3 bg-green-500 animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>

            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-green-600 tracking-wide uppercase">Live Pickup Status</span>
                    </div>

                    {/* Timer or Estimated Time could go here */}
                    <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        ETA: -- mins
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-2">
                                {booking.status}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Truck className="h-4 w-4" />
                                {booking.agent ? (
                                    <span>Agent <span className="font-semibold text-gray-900">{booking.agent.name}</span> assigned</span>
                                ) : (
                                    <span>Searching for nearby agent...</span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {booking.agent && (
                                <Button
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-full px-6 shadow-lg shadow-green-500/20"
                                    onClick={() => router.push(`/track/${booking.id}`)}
                                >
                                    <MapPin className="mr-2 h-4 w-4" /> Track Live
                                </Button>
                            )}

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="rounded-full px-6 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200">
                                        Cancel
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Pickup?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to cancel this pickup request? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>
                    </div>

                    {/* Live Animation */}
                    <div className="relative h-32 w-32 md:h-40 md:w-40 flex-shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="relative inline-flex rounded-full h-16 w-16 bg-green-100 flex items-center justify-center border-4 border-white shadow-sm z-10">
                                <Truck className="h-8 w-8 text-green-600" />
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
