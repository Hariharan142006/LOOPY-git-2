'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOperationsAnalyticsAction } from '@/app/actions';

// Static metrics for radar
const efficiencyMetrics = [
    { subject: 'Speed', A: 120, fullMark: 150 },
    { subject: 'Completion', A: 98, fullMark: 100 },
    { subject: 'Rating', A: 86, fullMark: 100 },
    { subject: 'Volume', A: 99, fullMark: 100 },
    { subject: 'On-Time', A: 85, fullMark: 100 },
    { subject: 'Acceptance', A: 65, fullMark: 100 },
];

export function OperationsAnalytics() {
    const [data, setData] = useState<any>({
        completionRate: 0,
        cancellationRate: 0,
        peakHours: [],
        avgPickupTime: '0m',
        totalBookings: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const res = await getOperationsAnalyticsAction();
                setData(res);
            } catch (error) {
                console.error("Failed to fetch operations analytics");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Completion Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data.completionRate}%</div>
                        <p className="text-xs text-green-400">Target &gt; 90%</p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Cancellation Rate</CardTitle>
                        <XCircle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data.cancellationRate}%</div>
                        <p className="text-xs text-gray-400">Target &lt; 5%</p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Avg Pickup Time</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data.avgPickupTime}</div>
                        <p className="text-xs text-yellow-400">Benchmark: 30m</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Peak Pickup Hours</CardTitle>
                        <CardDescription>Activity distribution by time of day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.peakHours}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    />
                                    <Bar dataKey="pickups" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
