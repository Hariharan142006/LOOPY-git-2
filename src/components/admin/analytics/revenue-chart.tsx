'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RevenueChartProps {
    data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    // Transform data for chart if needed. For now assume data is [{ name: 'Jan', total: 1000 }]
    // If data is raw bookings, we process it here.

    // Mock processing - grouping by date (last 7 days)
    const processedData = processData(data);

    return (
        <Card className="col-span-4 border-white/10 bg-white/5">
            <CardHeader>
                <CardTitle className="text-white">Revenue Overview</CardTitle>
                <CardDescription className="text-gray-400">Daily revenue for the past 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                itemStyle={{ color: '#4ade80' }}
                                formatter={(value: any) => [`₹${value}`, 'Revenue']}
                            />
                            <Bar
                                dataKey="total"
                                fill="#4ade80"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

function processData(bookings: any[]) {
    // Get last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    return days.map(day => {
        const dateStr = day.toDateString();
        const shortName = day.toLocaleDateString('en-US', { weekday: 'short' });

        // Filter bookings for this day
        const dayTotal = bookings
            .filter(b => b.status === 'COMPLETED' && new Date(b.updatedAt).toDateString() === dateStr)
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return {
            name: shortName,
            total: dayTotal
        };
    });
}
