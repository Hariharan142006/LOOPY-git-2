'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, Users, TrendingUp, Truck, Package, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { getAllBookingsAction, getUsersAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RevenueChart } from '@/components/admin/analytics/revenue-chart';
import { StatsCards } from '@/components/admin/analytics/stats-cards';

export default function AdminDashboardPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
        // Refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [bookingsData, usersData] = await Promise.all([
                getAllBookingsAction(),
                getUsersAction()
            ]);
            setBookings(bookingsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate metrics
    const totalRevenue = bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const activeBookings = bookings.filter(b =>
        ['ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'WEIGHING'].includes(b.status)
    ).length;

    const completedToday = bookings.filter(b => {
        const today = new Date().setHours(0, 0, 0, 0);
        const bookingDate = new Date(b.createdAt).setHours(0, 0, 0, 0);
        return b.status === 'COMPLETED' && bookingDate === today;
    }).length;

    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;

    const customers = users.filter(u => u.role === 'CUSTOMER').length;
    const agents = users.filter(u => u.role === 'AGENT');
    const onlineAgents = agents.filter(a => a.isOnline).length;

    // Recent completed bookings
    const recentCompleted = bookings
        .filter(b => b.status === 'COMPLETED')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Overview</h1>
                        <p className="text-gray-400">Real-time platform performance and business analytics.</p>
                    </div>
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hidden">
                        <FileText className="mr-2 h-4 w-4" /> Export Report (Mock)
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards
                totalRevenue={totalRevenue}
                activeBookings={activeBookings}
                pendingBookings={pendingBookings}
                totalUsers={users.length}
                completedToday={completedToday}
                totalBookings={bookings.length}
            />

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <Link href="/admin/pickups">
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4">
                        <div className="flex flex-col items-center gap-2">
                            <Package className="h-5 w-5" />
                            <span className="text-sm">Monitor Pickups</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/admin/users">
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4">
                        <div className="flex flex-col items-center gap-2">
                            <Users className="h-5 w-5" />
                            <span className="text-sm">Manage Users</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/admin/agents">
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4">
                        <div className="flex flex-col items-center gap-2">
                            <Truck className="h-5 w-5" />
                            <span className="text-sm">Manage Agents</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/admin/rates">
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4">
                        <div className="flex flex-col items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-sm">Pricing Config</span>
                        </div>
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <RevenueChart data={bookings} />

                {/* Active Agents */}
                <Card className="col-span-3 border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Active Agents</CardTitle>
                        <CardDescription>{onlineAgents} of {agents.length} agents online</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {agents.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No agents registered</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {agents.slice(0, 5).map((agent) => (
                                    <div key={agent.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                                        <span className="relative flex h-2 w-2">
                                            {agent.isOnline && (
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            )}
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        </span>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium text-white leading-none">{agent.name}</p>
                                            <p className="text-xs text-gray-500">{agent.phone}</p>
                                        </div>
                                        {agent.isOnline && (
                                            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Online</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Completed Pickups Row */}
            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentCompleted.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>No completed pickups yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentCompleted.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-green-500/30 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white">#{booking.id.slice(-6)}</p>
                                        <p className="text-xs text-gray-400">
                                            {booking.user?.name} • {booking.items?.length || 0} items
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-green-400">+₹{booking.totalAmount?.toFixed(2) || '0.00'}</div>
                                        <p className="text-xs text-gray-500">{new Date(booking.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
