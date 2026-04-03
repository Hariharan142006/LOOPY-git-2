'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout';
import { getBookingAgentLocationAction } from '@/app/actions';
import CustomerTrackingMap from '@/components/customer-tracking-map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, ChevronLeft, Loader2, Truck, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function TrackingPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [bookingData, setBookingData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [agentLocation, setAgentLocation] = useState<{ lat: number, lng: number } | null>(null);

    const fetchTrackingData = useCallback(async (isInitial = false) => {
        try {
            const data = await getBookingAgentLocationAction(bookingId);
            if (data) {
                setBookingData(data);
                if (data.agent?.currentLat && data.agent?.currentLng) {
                    setAgentLocation({
                        lat: data.agent.currentLat,
                        lng: data.agent.currentLng
                    });
                }
            } else if (isInitial) {
                toast.error("Tracking info not available");
            }
        } catch (error) {
            console.error("Tracking fetch error:", error);
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchTrackingData(true);

        const interval = setInterval(() => {
            fetchTrackingData();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [fetchTrackingData]);

    const handleCallAgent = () => {
        if (bookingData?.agent?.phone) {
            window.location.href = `tel:${bookingData.agent.phone}`;
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                    <p className="text-gray-500 font-medium">Connecting to Agent's GPS...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!bookingData) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <p className="text-red-500 font-bold">Booking not found or tracking unavailable.</p>
                    <Button onClick={() => router.back()} variant="ghost" className="mt-4">
                        <ChevronLeft className="h-4 w-4 mr-2" /> Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const { agent, status, pickupLat, pickupLng, queuePosition, activeBookingsCount } = bookingData;

    const milestones = [
        { key: 'PENDING', label: 'Requested', icon: MapPin },
        { key: 'ASSIGNED', label: 'Agent Assigned', icon: Truck },
        { key: 'ONEWAY', label: 'On the Way', icon: Navigation },
        { key: 'ARRIVED', label: 'Arrived', icon: MapPin },
        { key: 'WEIGHED', label: 'Weighing', icon: Loader2 },
        { key: 'PAID', label: 'Completed', icon: CheckCircle2 },
    ];

    const currentStepIndex = milestones.findIndex(m => {
        if (status === 'COMPLETED' || status === 'PAID') return m.key === 'PAID';
        return m.key === status;
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative pb-10">
                {/* Header Area */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 border-gray-200"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Track Your Pickup</h1>
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-widest">#{bookingId.slice(-6)} • {status}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Milestones) */}
                <div className="mb-6 px-2">
                    <div className="relative flex justify-between items-start">
                        {/* Progress Line */}
                        <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-100 -z-10">
                            <div
                                className="h-full bg-green-500 transition-all duration-1000"
                                style={{ width: `${(Math.max(0, currentStepIndex) / (milestones.length - 1)) * 100}%` }}
                            />
                        </div>

                        {milestones.map((step, idx) => {
                            const isCompleted = idx < currentStepIndex;
                            const isActive = idx === currentStepIndex;
                            const Icon = step.icon;

                            return (
                                <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`
                                        h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500
                                        ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-white border-2 border-green-500 text-green-600 shadow-lg scale-110' : 'bg-white border-2 border-gray-100 text-gray-300'}
                                    `}>
                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-tight text-center ${isActive ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Map Section */}
                <div className="flex-1 min-h-[400px] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl relative mb-6">
                    <CustomerTrackingMap
                        agentLocation={agentLocation}
                        pickupLocation={{ lat: pickupLat, lng: pickupLng }}
                        agentName={agent?.name}
                        bookingStatus={status}
                    />

                    {/* Floating Status Overlay */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-auto">
                        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4">
                            {queuePosition > 0 && status === 'ASSIGNED' ? (
                                <>
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                        <Clock className="h-5 w-5 animate-pulse" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-black text-gray-900 leading-none mb-1">Busy nearby</p>
                                        <p className="text-[10px] font-bold text-gray-400">Agent is completing {queuePosition} order{queuePosition > 1 ? 's' : ''}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${status === 'ONEWAY' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                        {status === 'ONEWAY' ? <Navigation className="h-5 w-5 animate-bounce" /> : <Truck className="h-5 w-5" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-black text-gray-900 leading-none mb-1">
                                            {status === 'ONEWAY' ? 'Trip Started' : status === 'ARRIVED' ? 'Agent Arrived' : 'On Schedule'}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400">
                                            {status === 'ONEWAY' ? 'Agent heading to your location' : 'Sharing live GPS location'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Agent Card */}
                {agent && (
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800 shadow-inner">
                                            <div className="relative">
                                                <Truck className="h-7 w-7" />
                                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">{agent.name}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-yellow-500">★</span>
                                                    <span className="text-[11px] font-bold text-gray-600">4.9</span>
                                                </div>
                                                <div className="h-3 w-[1px] bg-gray-200" />
                                                <p className="text-[11px] font-bold text-blue-600">Pro Agent</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 justify-end">
                                    <Button
                                        onClick={handleCallAgent}
                                        className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest gap-2 shadow-xl transition-all hover:scale-105"
                                    >
                                        <Phone className="h-4 w-4" /> Call Agent
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-2xl border-gray-100 hover:bg-gray-50 text-gray-400"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}

import { CheckCircle2, Navigation } from 'lucide-react';
