'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Phone, Navigation, CheckCircle, Package, Loader2, User, Wallet, LogOut } from 'lucide-react';
import Link from 'next/link';
import { getAgentTasksAction, assignAgentToBookingAction, updateAgentLocationAction, toggleAgentOnlineAction } from '@/app/actions';
import { getWalletBalanceAction } from '@/app/wallet-actions';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { SwipeButton } from '@/components/swipe-button';
import { motion } from 'framer-motion';
import { MiniTruck } from '@/components/mini-truck';

const AgentRouteMap = dynamic(() => import('@/components/agent-route-map'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-500 border border-gray-200">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Initializing Map...
    </div>
});

// Mock active tasks
const TASKS = [
    {
        id: 'BK-8901',
        customer: 'Alice Johnson',
        address: '123, Green Street, City',
        lat: 20.5937,
        lng: 78.9629,
        items: ['Plastic', 'Cardboard'],
        status: 'ASSIGNED', // ASSIGNED, ARRIVED, WEIGHED, COMPLETED
        time: '14:00 - 16:00',
        distance: '2.4 km',
    },
    {
        id: 'BK-9988',
        customer: 'Bob Smith',
        address: '45, Market Road, City',
        lat: 20.6000,
        lng: 78.9700,
        items: ['Iron', 'E-Waste'],
        status: 'PENDING_ACCEPTANCE',
        time: '16:00 - 18:00',
        distance: '5.1 km',
    }
];

const DISTANCE_LIMIT = 5.0; // km

const PickupCard = ({ task, onAccept }: { task: any, onAccept?: (id: string) => void }) => {
    const isTooFar = task.status === 'PENDING' && task.distance > DISTANCE_LIMIT;

    const formatScheduleSlot = (date: string) => {
        const d = new Date(date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        let timeRange = '';
        if (hours === 9 && minutes === 30) timeRange = '9:30 AM - 11:30 AM';
        else if (hours === 11 && minutes === 30) timeRange = '11:30 AM - 1:30 PM';
        else if (hours === 14 && minutes === 30) timeRange = '2:30 PM - 4:30 PM';
        else if (hours === 16 && minutes === 30) timeRange = '4:30 PM - 7:00 PM';
        else timeRange = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return `${dateStr}, ${timeRange}`;
    };

    return (
        <Card key={task.id} className="bg-white border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className={`mb-2 font-medium ${task.status === 'PENDING' ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-green-200 text-green-700 bg-green-50'}`}>
                            {task.status === 'PENDING' ? 'New Request' : task.status}
                        </Badge>
                        <CardTitle className="text-lg text-gray-900 font-bold">{task.user?.name || 'Unknown User'}</CardTitle>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm font-bold text-gray-900 font-mono text-right whitespace-nowrap">
                            {formatScheduleSlot(task.scheduledAt)}
                        </span>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Scheduled</span>
                            {task.distance !== undefined && task.distance > 0 && (
                                <Badge variant="secondary" className={`mt-1 text-[10px] h-4 border-none font-bold ${task.distance < 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {task.distance < 1 ? `${(task.distance * 1000).toFixed(0)}m` : `${task.distance.toFixed(1)}km`} {task.distance < 2 ? 'Nearby' : 'away'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3 w-3 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pt-0.5 font-medium">
                            {task.address?.street}, {task.address?.city}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="h-3 w-3 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                            {(() => {
                                const categories = Array.from(new Set(task.items?.map((i: any) => i.item.category?.name || i.item.name).filter(Boolean)));
                                return categories.join(', ') || 'Various Items';
                            })()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    {task.status === 'PENDING' ? (
                        <>
                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300" disabled={isTooFar}>
                                Decline
                            </Button>
                            {isTooFar ? (
                                <div className="flex items-center justify-center bg-gray-50 text-gray-400 text-xs font-bold rounded-md border border-gray-100 px-3 py-2 text-center h-full">
                                    Too far to claim (Max {DISTANCE_LIMIT}km)
                                </div>
                            ) : (
                                <Button
                                    onClick={() => onAccept && onAccept(task.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm"
                                >
                                    Accept Pickup
                                </Button>
                            )}
                        </>
                    ) : task.status === 'COMPLETED' ? (
                        <div className="col-span-2 bg-green-50 text-green-700 rounded-md py-2 text-center font-medium flex items-center justify-center gap-2 border border-green-100">
                            <CheckCircle className="h-4 w-4" />
                            Pickup Completed
                        </div>
                    ) : (
                        <>
                            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                <Phone className="h-4 w-4 mr-2" /> Call
                            </Button>
                            <Link href={`/agent/pickup/${task.id}`} className="w-full">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
                                    <Navigation className="h-4 w-4 mr-2" /> Continue
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function AgentDashboard() {
    const { user, logout } = useAuthStore();
    const [tasks, setTasks] = useState<{ available: any[], accepted: any[], completed: any[] }>({ available: [], accepted: [], completed: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Status State
    const [isOnline, setIsOnline] = useState(false);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);

    // Sync local state with user prop initially
    useEffect(() => {
        if (user) {
            setIsOnline(user.isOnline || false);
        }
    }, [user]);

    const handleToggleStatus = async (newStatus: boolean) => {
        if (!user?.id || isStatusUpdating) return;

        setIsStatusUpdating(true);
        try {
            const result = await toggleAgentOnlineAction(user.id, newStatus);
            if (result.success) {
                setIsOnline(newStatus);
                toast.success(newStatus ? 'You are now Online' : 'You are now Offline');
                if (newStatus) {
                    fetchTasks(); // Fetch immediately when going online
                }
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Status Toggle Error:', error);
            toast.error('Error updating status');
        } finally {
            setIsStatusUpdating(false);
        }
    };

    // Auto-Offline removed as per request - Agent stays online unless manually toggled or logged out



    // Initial fetch
    useEffect(() => {
        if (user?.id) {
            fetchTasks();
        }
    }, [user?.id]);

    // Polling every 5 seconds (Real-time tasks)
    useEffect(() => {
        if (!user?.id) return;
        const interval = setInterval(fetchTasks, 5000);
        return () => clearInterval(interval);
    }, [user?.id]);

    // Location Tracking (Every 30 seconds)
    useEffect(() => {
        if (!user?.id) return;

        const updateLocation = () => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log(`[Agent] Location: ${latitude}, ${longitude}`);
                        setCurrentLocation({ lat: latitude, lng: longitude });
                        await updateAgentLocationAction(user.id, latitude, longitude);
                    },
                    (error) => {
                        console.error('[Agent] Location Error:', error);
                    },
                    { enableHighAccuracy: true }
                );
            }
        };

        // Initial call
        updateLocation();

        // Interval (Faster updates for real-time distance)
        const locInterval = setInterval(updateLocation, 10000);
        return () => clearInterval(locInterval);
    }, [user?.id]);

    const [walletBalance, setWalletBalance] = useState(0);

    const fetchTasks = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        try {
            const [tasksData, balance] = await Promise.all([
                getAgentTasksAction(user.id, currentLocation?.lat, currentLocation?.lng),
                getWalletBalanceAction(user.id)
            ]);
            setTasks(tasksData);
            setWalletBalance(balance);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptTask = async (bookingId: string) => {
        if (!user?.id) return;
        try {
            const result = await assignAgentToBookingAction(bookingId, user.id);
            if (result.success) {
                toast.success('Pickup Accepted!');
                fetchTasks(); // Refresh immediately
            } else {
                toast.error(result.error || 'Failed to accept pickup');
            }
        } catch (error) {
            toast.error('Error accepting pickup');
        }
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!user && !isLoading) {
            window.location.href = '/login';
        }
    }, [user, isLoading]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    // Offline Overlay (Modal)
    if (!isOnline && user && !isLoading) {
        return (
            <div className="min-h-screen bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center z-50 fixed inset-0">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-6">
                    <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-10 w-10 text-gray-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">You are Offline</h2>
                        <p className="text-gray-500 mt-2">Swipe below to go online and start receiving pickup requests.</p>
                    </div>

                    <div className="pt-4">
                        <SwipeButton
                            text="Swipe to Go Online"
                            isOnline={false}
                            isLoading={isStatusUpdating}
                            onComplete={() => handleToggleStatus(true)}
                        />
                    </div>

                    <Button
                        variant="ghost"
                        onClick={async () => {
                            if (user?.id) {
                                await toggleAgentOnlineAction(user.id, false);
                            }
                            logout();
                        }}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 pb-20 overflow-hidden">
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Agent Dashboard</h1>
                        <p className="text-gray-500">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/agent/profile">
                            <Button variant="outline" className="gap-2">
                                <User className="h-4 w-4" />
                                Profile
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            onClick={async () => {
                                if (user?.id) {
                                    await toggleAgentOnlineAction(user.id, false);
                                }
                                logout();
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                        <div className="w-[200px]">
                            {/* Toggle Swipe Button in Header */}
                            <SwipeButton
                                text="Swipe Offline"
                                completedText="Offline"
                                isOnline={true}
                                isLoading={isStatusUpdating}
                                onComplete={() => handleToggleStatus(false)}
                                className="h-10 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10 transition-all group-hover:bg-green-100/50"></div>
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
                            <span className="text-4xl font-bold text-gray-900 mb-1">
                                {tasks.completed.length}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                <CheckCircle className="h-3 w-3 text-green-600" /> Completed
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-50 rounded-full -ml-10 -mb-10 transition-all group-hover:bg-blue-100/50"></div>
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
                            <span className="text-4xl font-bold text-green-600 mb-1">₹{Math.floor(walletBalance)}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                                <Package className="h-3 w-3 text-blue-600" /> Earnings
                            </div>
                            <Link href="/agent/profile" className="w-full">
                                <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1">
                                    <Wallet className="h-3 w-3" /> View Wallet
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-green-600" />
                            {viewMode === 'list' ? 'Pickup Requests' : 'Route Map'}
                        </h2>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <Button
                                size="sm"
                                variant={viewMode === 'list' ? 'outline' : 'ghost'}
                                className={`h-8 text-xs ${viewMode === 'list' ? 'bg-white border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                onClick={() => setViewMode('list')}
                            >
                                List View
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'map' ? 'outline' : 'ghost'}
                                className={`h-8 text-xs ${viewMode === 'map' ? 'bg-white border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                onClick={() => setViewMode('map')}
                            >
                                Map View
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : viewMode === 'map' ? (
                        <div className="space-y-4">
                            <AgentRouteMap
                                agentLocation={currentLocation}
                                tasks={[...tasks.accepted, ...tasks.available]}
                            />
                            <div className="grid grid-cols-2 gap-3 text-xs italic text-gray-500 px-1">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Available
                                </div>
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span> Assigned (Optimized)
                                </div>
                            </div>
                        </div>
                    ) : tasks.available.length === 0 && tasks.accepted.length === 0 && tasks.completed.length === 0 ? (
                        <div className="relative h-48 bg-gray-100/50 rounded-xl overflow-hidden border border-gray-200 flex flex-col items-center justify-center">
                            <motion.div
                                className="absolute bottom-8"
                                initial={{ left: "-30%" }}
                                animate={{ left: "130%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3.5,
                                    ease: "linear",
                                }}
                            >
                                <MiniTruck className="transform scale-75" wheelRotation={0} isMoving={true} />
                                {/* Self-rotating wheels are handled inside MiniTruck or can be animated here if exposed */}
                            </motion.div>

                            <div className="text-center z-10 glass-panel p-4 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm mt-8">
                                <h3 className="font-bold text-gray-800 text-lg">No Active Pickups</h3>
                                <p className="text-gray-500 text-sm">Searching for nearby requests...</p>
                            </div>

                            {/* Road Line */}
                            <div className="absolute bottom-8 left-0 right-0 h-[2px] bg-gray-300">
                                <div className="w-full h-full border-t-2 border-dashed border-yellow-400/50"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-10">
                            {/* 1. Accepted Requests Section */}
                            {tasks.accepted.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-green-600 px-1">Accepted Requests</h3>
                                    <div className="space-y-4">
                                        {tasks.accepted.map((task) => (
                                            <PickupCard key={task.id} task={task} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 2. Pickup Requests (Available) Section */}
                            {tasks.available.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 px-1">Pickup Requests (Pool)</h3>
                                    <div className="space-y-4">
                                        {tasks.available.map((task) => (
                                            <PickupCard key={task.id} task={task} onAccept={handleAcceptTask} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. Completed Bookings Section */}
                            {tasks.completed.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-1">Completed Bookings</h3>
                                    <div className="space-y-4 opacity-75 grayscale-[0.5]">
                                        {tasks.completed.map((task) => (
                                            <PickupCard key={task.id} task={task} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
