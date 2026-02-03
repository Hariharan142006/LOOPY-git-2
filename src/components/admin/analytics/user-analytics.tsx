'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, UserPlus, UserCheck, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserAnalyticsAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

export function UserAnalytics() {
    const [data, setData] = useState({
        newUsersToday: 0,
        activeUsers: 0,
        totalUsers: 0,
        repeatRate: 0,
        growthData: [] as { date: string, users: number }[]
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getUserAnalyticsAction();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch user analytics");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Active User Percentage
    const activePercentage = data.totalUsers > 0
        ? Math.round((data.activeUsers / data.totalUsers) * 100)
        : 0;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">New Users (Today)</CardTitle>
                        <UserPlus className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">+{data.newUsersToday}</div>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Active Users (30d)</CardTitle>
                        <Activity className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data.activeUsers}</div>
                        <p className="text-xs text-gray-400">{activePercentage}% of total registered</p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Repeat Customers</CardTitle>
                        <UserCheck className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data.repeatRate}%</div>
                        <p className="text-xs text-gray-400">High loyalty rate</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-white">User Growth</CardTitle>
                    <CardDescription>Total registered users over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.growthData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
