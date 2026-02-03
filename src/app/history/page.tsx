'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import DashboardLayout from '@/app/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar as CalendarIcon, Truck, CheckCircle2, Clock, XCircle, ArrowRight, Loader2, FileText } from 'lucide-react';
import { downloadInvoice } from '@/lib/invoice-utils';
import { formatCurrency } from '@/lib/pricing';
import { toast } from 'sonner';
import { getUserBookingsAction } from '@/app/actions';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
    ASSIGNED: { label: 'Agent Assigned', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck },
    ARRIVED: { label: 'Arriving Now', color: 'bg-green-50 text-green-700 border-green-200', icon: Truck },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
    COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

export default function HistoryPage() {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadBookings();
        }
    }, [user?.id]);

    const loadBookings = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            console.log('[History] Loading bookings for user:', user.id);
            const data = await getUserBookingsAction(user.id);
            console.log('[History] Loaded bookings:', data.length);
            setBookings(data);
        } catch (error) {
            console.error('[History] Error loading bookings:', error);
            toast.error('Failed to load booking history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCallAgent = (phone: string, name: string) => {
        toast.info(`Calling ${name}...`);
        window.location.href = `tel:${phone}`;
    };

    const handleTrackOrder = (booking: any) => {
        if (booking.pickupLat && booking.pickupLng) {
            const lat = booking.pickupLat;
            const lng = booking.pickupLng;
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            window.open(url, '_blank');
            toast.success('Opening location in Google Maps');
        } else {
            toast.error('Location not available for this booking');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        // Format as HH:MM using the exact UTC time stored (which is the user's local time)
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Bookings</h1>
                    <p className="text-gray-500">Track current pickups and view past history.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                ) : bookings.length === 0 ? (
                    <Card className="border-gray-200 bg-white">
                        <CardContent className="p-8 text-center text-gray-500">
                            <p>No bookings yet. Book your first pickup!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                            const StatusIcon = status.icon;
                            const itemNames = booking.items?.map((bi: any) => bi.item?.name || 'Item').join(', ') || 'No items';

                            return (
                                <Card key={booking.id} className="border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md">
                                    <CardHeader className="pb-2">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg text-gray-900">#{booking.id.slice(0, 8).toUpperCase()}</CardTitle>
                                                <Badge variant="outline" className={`flex gap-1 items-center border ${status.color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-gray-500 font-medium">
                                                {formatDate(booking.createdAt)}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Time Slot</span>
                                                <span className="text-sm text-gray-900 flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                    {formatTime(booking.scheduledAt)}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Items</span>
                                                <span className="text-sm text-gray-900">{itemNames}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Location</span>
                                                <span className="text-sm text-gray-900 flex items-center gap-2 truncate">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    {booking.address?.street || 'Location'}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Value</span>
                                                <span className="text-sm font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
                                            </div>
                                        </div>

                                        {booking.status === 'COMPLETED' && (
                                            <div className="mt-4 flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadInvoice(booking);
                                                    }}
                                                    className="gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Download Invoice
                                                </Button>
                                            </div>
                                        )}

                                        {booking.agent && (
                                            <div className="mt-4 rounded-lg bg-gray-50 p-3 flex items-center justify-between border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                        <Truck className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{booking.agent.name}</p>
                                                        <p className="text-xs text-gray-500">{booking.agent.phone}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCallAgent(booking.agent.phone, booking.agent.name)}
                                                    className="h-8 text-xs border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white"
                                                >
                                                    Call Agent
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                    {(booking.status === 'ARRIVED' || booking.status === 'IN_PROGRESS') && (
                                        <CardFooter className="pt-0">
                                            <Button
                                                onClick={() => handleTrackOrder(booking)}
                                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm font-medium"
                                            >
                                                Track Live Location <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
