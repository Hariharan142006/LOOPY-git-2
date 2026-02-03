'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserDashboardStatsAction } from '@/app/actions';
import { Calendar, TrendingUp, Truck, MapPin, Wallet, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { WithdrawDialog } from '@/components/dashboard/withdraw-dialog';
import { ActivePickupCard } from '@/components/dashboard/active-pickup-card';
import { MovingTruckBanner } from '@/components/dashboard/moving-truck-banner';
import { getUserActiveBookingAction } from '@/app/actions';
import { ReviewDialog } from '@/components/dashboard/review-dialog';

interface DashboardStats {
    totalEarnings: number;
    growthPercentage: number;
    recentActivity: {
        id: string;
        status: string;
        date: Date;
        amount: number;
        hash: string;
        hasReview?: boolean;
    }[];
}

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activeBooking, setActiveBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is present OR wait for potential hydration
        // Since we are using persist, we might need to wait for rehydration.
        // A simple check is to wait for mount effect to ensure client-side rendering is established.
        // However, if user is really null (not logged in), we should redirect.
        // Zustand persist usually loads synchrounously from localStorage if available, but let's be safe.
        const checkAuth = () => {
            const stored = localStorage.getItem('auth-storage');
            if (!user && !stored) {
                router.push('/login');
            }
        };

        checkAuth();


        const fetchStats = async () => {
            if (user?.id) {
                const [data, booking] = await Promise.all([
                    getUserDashboardStatsAction(user.id),
                    getUserActiveBookingAction(user.id)
                ]);
                setStats(data);
                setActiveBooking(booking);
            }
            setLoading(false);
        };

        fetchStats();

        // Poll for updates (Real-time tracking)
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [user, router]);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Hello, <span className="text-green-600 uppercase">{user.name}</span>
                </h1>
                <p className="text-gray-500 mt-2">Manage your scrap pickups and track earnings properly.</p>
            </div>

            {/* Top Section: Banner & Earnings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Active Booking Card OR Book Pickup Banner */}
                {activeBooking ? (
                    <ActivePickupCard booking={activeBooking} />
                ) : (
                    <MovingTruckBanner />
                )}

                {/* Earnings Card */}
                <Card className="rounded-3xl border-gray-200 shadow-sm flex flex-col justify-between">
                    <CardContent className="p-8 space-y-6">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Total Earnings</p>
                            <h2 className="text-4xl font-bold text-gray-900">₹{Math.floor(stats?.totalEarnings || 0)}</h2>
                            <div className="mt-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                +{stats?.growthPercentage}% from last month
                            </div>
                        </div>

                        <div className="mt-auto pt-4">
                            <WithdrawDialog
                                availableAmount={stats?.totalEarnings || 0}
                                trigger={
                                    <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-medium text-gray-700">
                                        <Wallet className="mr-2 h-4 w-4" /> Withdraw
                                    </Button>
                                }
                            />
                        </div>
                    </CardContent>

                    {/* Decorative Circle */}
                    <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-green-50 pointer-events-none" />
                </Card>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Schedule Pickup */}
                <Link href="/book" className="group">
                    <Card className="h-full rounded-2xl border-gray-200 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 transition-all cursor-pointer">
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Schedule Pickup</h3>
                            <p className="text-sm text-gray-500 mb-6 flex-grow">
                                Got scrap? Schedule a hassle-free pickup at your doorstep. We weigh, pay, and collect instantly.
                            </p>
                            <div className="flex items-center text-sm font-bold text-green-600 group-hover:translate-x-1 transition-transform">
                                Book Now <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Check Rates */}
                <Link href="/rates" className="group">
                    <Card className="h-full rounded-2xl border-gray-200 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer">
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Check Rates</h3>
                            <p className="text-sm text-gray-500 mb-6 flex-grow">
                                Stay updated with the latest market prices for all scrap categories. Maximize your earnings.
                            </p>
                            <div className="flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                                View Rates <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* My Addresses */}
                <Link href="/profile" className="group">
                    <Card className="h-full rounded-2xl border-gray-200 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer">
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">My Addresses</h3>
                            <p className="text-sm text-gray-500 mb-6 flex-grow">
                                Manage your pickup locations. Add home, office, or warehouse addresses for quick bookings.
                            </p>
                            <div className="flex items-center text-sm font-bold text-gray-700 group-hover:translate-x-1 transition-transform">
                                Manage <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                <Card className="rounded-2xl border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {stats?.recentActivity.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No recent activity found.
                            </div>
                        ) : (
                            stats?.recentActivity.map((activity) => (
                                <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                            activity.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {activity.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> :
                                                activity.status === 'CANCELLED' ? <AlertCircle className="h-5 w-5" /> :
                                                    <Truck className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Pickup #{activity.hash}</p>
                                            <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <p className="font-bold text-gray-900">₹{(activity.amount).toFixed(0)}</p>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${activity.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            activity.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {activity.status}
                                        </span>
                                        {activity.status === 'COMPLETED' && !activity.hasReview && (
                                            <div className="mt-1">
                                                <ReviewDialog bookingId={activity.id} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

        </div>
    );
}
