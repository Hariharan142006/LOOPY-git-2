'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { IndianRupee, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRevenueAnalyticsAction } from '@/app/actions';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RevenueAnalytics() {
    const [data, setData] = useState<any>({
        totalRevenue: 0,
        avgRevenue: 0,
        revenueTrend: [],
        revenueByCity: [],
        revenueByScrap: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const res = await getRevenueAnalyticsAction();
                // console.log("Revenue Analytics Data:", res);
                setData(res);
            } catch (error) {
                console.error("Failed to fetch revenue analytics", error);
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
            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{data.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Lifetime
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Avg. Per Pickup</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{Math.round(data.avgRevenue)}</div>
                        <p className="text-xs text-blue-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Per completed job
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue Trend</CardTitle>
                        <CardDescription>Daily revenue over the last week</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.revenueTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                        itemStyle={{ color: '#4ade80' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue by Scrap Type</CardTitle>
                        <CardDescription>Distribution by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {data.revenueByScrap.filter((item: any) => item.value > 0).length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No scrap revenue data available yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.revenueByScrap.filter((item: any) => item.value > 0)}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.revenueByScrap.filter((item: any) => item.value > 0).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                            formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                        />
                                        <Legend
                                            wrapperStyle={{ paddingTop: '10px' }}
                                            formatter={(value) => <span className="text-gray-200 text-sm">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4">
                <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Top Performing Cities</CardTitle>
                        <CardDescription>Revenue Breakdown by City</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.revenueByCity} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} hide />
                                    <YAxis dataKey="name" type="category" stroke="#fff" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    />
                                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={30}>
                                        {data.revenueByCity.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
