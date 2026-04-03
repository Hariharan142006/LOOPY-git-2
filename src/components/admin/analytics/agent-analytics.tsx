'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Star, Award, TrendingUp, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAgentAnalyticsAction } from '@/app/actions';

export function AgentAnalytics() {
    const [data, setData] = useState<any>({
        topAgents: [],
        avgRating: 0,
        avgRevenue: 0,
        totalAgents: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const res = await getAgentAnalyticsAction();
                setData(res);
            } catch (error) {
                console.error("Failed to fetch agent analytics");
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

    const topAgent = data.topAgents.length > 0 ? data.topAgents[0] : { name: 'N/A', pickups: 0, revenue: 0 };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-white/10 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-500">Top Agent (All Time)</CardTitle>
                        <Award className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{topAgent.name}</div>
                        <p className="text-xs text-gray-400">{topAgent.pickups} Pickups • ₹{topAgent.revenue.toLocaleString()} Revenue</p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Avg Agent Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data.avgRating} / 5.0</div>
                        <p className="text-xs text-gray-400">Based on feedback</p>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Avg Revenue/Agent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{Math.round(data.avgRevenue).toLocaleString()}</div>
                        <p className="text-xs text-green-400">High performance</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-white">Agent Leaderboard</CardTitle>
                    <CardDescription>Top performing field agents based on volume and quality</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.topAgents.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No agent data available yet
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Rank</TableHead>
                                    <TableHead className="text-gray-400">Agent Name</TableHead>
                                    <TableHead className="text-gray-400 text-right">Total Pickups</TableHead>
                                    <TableHead className="text-gray-400 text-right">Revenue</TableHead>
                                    <TableHead className="text-gray-400 text-center">On-Time %</TableHead>
                                    <TableHead className="text-gray-400 text-right">Rating</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.topAgents.map((agent: any, index: number) => (
                                    <TableRow key={agent.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">#{index + 1}</TableCell>
                                        <TableCell className="text-white">{agent.name}</TableCell>
                                        <TableCell className="text-right text-gray-300">{agent.pickups}</TableCell>
                                        <TableCell className="text-right text-green-400">₹{agent.revenue.toLocaleString()}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{agent.onTime}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1 text-yellow-400">
                                                {agent.rating} {agent.rating !== 'N/A' && <Star className="h-3 w-3 fill-yellow-400" />}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
