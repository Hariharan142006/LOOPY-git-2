'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, Truck, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
    totalRevenue: number;
    activeBookings: number;
    pendingBookings: number;
    totalUsers: number;
    completedToday: number;
    totalBookings: number;
}

export function StatsCards({ totalRevenue, activeBookings, pendingBookings, totalUsers, completedToday, totalBookings }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-white/10 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:border-green-500/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                    <IndianRupee className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">₹{totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-gray-400">Total earnings</p>
                </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:border-blue-500/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Active Bookings</CardTitle>
                    <Truck className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{activeBookings}</div>
                    <p className="text-xs text-gray-400">{pendingBookings} pending</p>
                </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 hover:border-yellow-500/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{totalUsers}</div>
                    <p className="text-xs text-gray-400">Registered accounts</p>
                </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:border-purple-500/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Today's Pickups</CardTitle>
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{completedToday}</div>
                    <p className="text-xs text-gray-400">Completed today</p>
                </CardContent>
            </Card>
        </div>
    );
}
