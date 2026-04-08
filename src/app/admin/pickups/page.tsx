'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Clock, Truck, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getAllBookingsAction, getAgentsAction, assignAgentToBookingAction, updateBookingStatusAction, deleteBookingAction } from '@/app/actions';
import { RequestsTable } from '@/components/admin/pickups/requests-table';
import { PickupDetailView } from '@/components/admin/pickups/pickup-detail-view';

type Booking = any;
type Agent = any;

export default function AdminPickupsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [bookingsData, agentsData] = await Promise.all([
                getAllBookingsAction(),
                getAgentsAction()
            ]);
            setBookings(bookingsData);
            setAgents(agentsData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignAgent = async (bookingId: string) => {
        // Find booking to get logic if needed, but for now we'll just open the detail view
        // Or in the future, open a specific assignment modal.
        // For this version, we will use the DetailView to handle assignment if we add that logic there, 
        // OR we'll implement a simple prompt here for ID if the table requests it.
        // The Table passes ID. We can show a prompt or a small dialog.
        // For simplicity, let's open the DetailView which *should* theoretically have assignment, 
        // but our DetailView currently handles Status/Remarks. 
        // Let's implement a simple "First Available Agent" or "Prompt" logic here for the table button.

        // Actually, the previous page had a dropdown. 
        // Let's Find the booking and open the detail view. 
        // NOTE: The RequestsTable has an "Assign" button. 
        // Let's make that button open the DetailView for now, as that's the "Control Center". (Or I can add Assign back to DetailView)
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) setSelectedBooking(booking);
    };

    const handleCancelPickup = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this pickup?')) return;

        await handleUpdateBooking(bookingId, { status: 'CANCELLED' });
    };

    const handleDeleteBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to completely delete this pickup? This cannot be undone.')) return;
        
        try {
            const result = await deleteBookingAction(bookingId);
            if (result.success) {
                toast.success('Pickup deleted successfully');
                setBookings(prev => prev.filter(b => b.id !== bookingId));
                setSelectedBooking(null);
            } else {
                toast.error(result.error || 'Failed to delete pickup');
            }
        } catch (error) {
            toast.error('Error deleting pickup');
        }
    };

    const handleUpdateBooking = async (bookingId: string, updates: any) => {
        // If status update
        if (updates.status) {
            const promise = updateBookingStatusAction(bookingId, updates.status);
            toast.promise(promise, { loading: 'Updating status...', success: 'Status updated', error: 'Failed to update status' });
            await promise;
        }

        // If agent assignment
        if (updates.agentId !== undefined) {
            // We assume backend handles null for unassign if we support it, 
            // but assignAgentToBookingAction typically takes an ID.
            if (updates.agentId) {
                const promise = assignAgentToBookingAction(bookingId, updates.agentId);
                toast.promise(promise, { loading: 'Assigning agent...', success: 'Agent assigned', error: 'Failed' });
                await promise;
            }
        }

        // Optimistic Update
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                const updatedBooking = { ...b, ...updates };
                if (updates.agentId && agents) {
                    updatedBooking.agent = agents.find(a => a.id === updates.agentId);
                }
                return updatedBooking;
            }
            return b;
        }));

        if (selectedBooking?.id === bookingId) {
            setSelectedBooking((prev: Booking | null) => {
                if (!prev) return null;
                const updated = { ...prev, ...updates };
                if (updates.agentId && agents) {
                    updated.agent = agents.find(a => a.id === updates.agentId);
                }
                return updated;
            });
        }
    };

    // Stats
    const total = bookings.length;
    const pending = bookings.filter((b: Booking) => b.status === 'PENDING').length;
    const completed = bookings.filter((b: Booking) => b.status === 'COMPLETED').length;
    const active = bookings.filter((b: Booking) => ['ASSIGNED', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length;

    const filteredBookings = bookings.filter(b =>
        b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Pickup Operations</h1>
                <p className="text-gray-400">Control center for all active and pending pickups.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Total Requests</CardTitle>
                        <Package className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Pending Action</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{pending}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">In Progress</CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{active}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="border-white/10 bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Active Requests</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search ID or Customer..."
                            className="pl-9 bg-black/20 border-white/10 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        </div>
                    ) : (
                        <RequestsTable
                            requests={filteredBookings}
                            onAssign={handleAssignAgent} // For now opens detail view or just logs
                            onCancel={handleCancelPickup}
                            onView={(id) => {
                                const booking = bookings.find(b => b.id === id);
                                if (booking) setSelectedBooking(booking);
                            }}
                        />
                    )}
                </CardContent>
            </Card>

            <PickupDetailView
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={selectedBooking}
                agents={agents}
                onUpdate={handleUpdateBooking}
                onDelete={handleDeleteBooking}
            />
        </div>
    );
}
