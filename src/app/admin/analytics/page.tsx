'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevenueAnalytics } from '@/components/admin/analytics/revenue-analytics';
import { OperationsAnalytics } from '@/components/admin/analytics/operations-analytics';
import { UserAnalytics } from '@/components/admin/analytics/user-analytics';
import { AgentAnalytics } from '@/components/admin/analytics/agent-analytics';
import { ScrapInsights } from '@/components/admin/analytics/scrap-insights';

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Advanced Analytics</h1>
                <p className="text-gray-400">Deep dive into business performance, operations, and user behavior.</p>
            </div>

            <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList className="bg-white/5 border border-white/10 w-full justify-start h-auto p-1 flex-wrap">
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                    <TabsTrigger value="scrap">Scrap Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="space-y-4">
                    <RevenueAnalytics />
                </TabsContent>

                <TabsContent value="operations" className="space-y-4">
                    <OperationsAnalytics />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <UserAnalytics />
                </TabsContent>

                <TabsContent value="agents" className="space-y-4">
                    <AgentAnalytics />
                </TabsContent>

                <TabsContent value="scrap" className="space-y-4">
                    <ScrapInsights />
                </TabsContent>
            </Tabs>
        </div>
    );
}
