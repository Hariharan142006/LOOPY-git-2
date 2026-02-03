'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, User, Phone, Clock } from 'lucide-react';

interface AgentTrackerProps {
    open: boolean;
    onClose: () => void;
    booking: any;
}

export default function AgentTracker({ open, onClose, booking }: AgentTrackerProps) {
    const handleOpenMaps = () => {
        if (booking?.pickupLat && booking?.pickupLng) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.pickupLat},${booking.pickupLng}`;
            window.open(url, '_blank');
        }
    };

    const calculateDistance = () => {
        // Mock distance for MVP - in production this would calculate from agent's live location
        return '2.5 km';
    };

    const estimateArrival = () => {
        // Mock ETA for MVP
        if (booking?.status === 'ARRIVED') return 'Agent has arrived';
        return '15 mins';
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        Track Agent
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Agent Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{booking?.agent?.name || 'Agent'}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {booking?.agent?.phone}
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-xs text-blue-600 font-medium mb-1">Distance</div>
                            <div className="text-lg font-bold text-blue-700">{calculateDistance()}</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                ETA
                            </div>
                            <div className="text-lg font-bold text-green-700">{estimateArrival()}</div>
                        </div>
                    </div>

                    {/* Pickup Location */}
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Pickup Location
                        </div>
                        <p className="text-sm text-gray-600">{booking?.address?.street || 'Location'}</p>
                    </div>

                    {/* Open in Maps */}
                    <Button
                        onClick={handleOpenMaps}
                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        <Navigation className="h-4 w-4" />
                        Open in Google Maps
                    </Button>

                    {/* Info Note */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                            ℹ️ Real-time agent location tracking will be available soon with our mobile app!
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
