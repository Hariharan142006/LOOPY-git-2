'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, AlertTriangle, Activity, LifeBuoy, Send, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettingsPage() {
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('ALL_USERS');
    const [isSending, setIsSending] = useState(false);

    // Emergency State
    const [operationsSuspended, setOperationsSuspended] = useState(false);
    const [surgePricing, setSurgePricing] = useState(false);

    const handleSendNotification = async () => {
        if (!message) {
            toast.error("Please enter a message");
            return;
        }
        setIsSending(true);
        // Mock send
        setTimeout(() => {
            toast.success(`Notification sent to ${target}`);
            setMessage('');
            setIsSending(false);
        }, 1000);
    };

    const handleEmergencyToggle = (checked: boolean, type: 'SUSPEND' | 'SURGE') => {
        if (type === 'SUSPEND') {
            if (checked) {
                if (confirm("CRITICAL: Are you sure you want to suspend ALL operations? This will prevent new bookings.")) {
                    setOperationsSuspended(true);
                    toast.error("Operations Suspended! Users cannot book pickups.");
                }
            } else {
                setOperationsSuspended(false);
                toast.success("Operations Resumed.");
            }
        } else if (type === 'SURGE') {
            setSurgePricing(checked);
            if (checked) toast.warning("Surge Pricing Enabled (+15% rates)");
            else toast.info("Surge Pricing Disabled");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
                <p className="text-gray-400">Configure platform operations, notifications, and emergency controls.</p>
            </div>

            <Tabs defaultValue="operations" className="space-y-4">
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="logs">Activity Logs</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>

                {/* Operations Tab */}
                <TabsContent value="operations" className="space-y-4">
                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardHeader>
                            <CardTitle className="text-red-400 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> Emergency Controls
                            </CardTitle>
                            <CardDescription className="text-red-300/70">
                                High-impact controls. Use with caution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base text-white">Suspend All Operations</Label>
                                    <p className="text-sm text-gray-400">Temporarily disable all new bookings and agent assignments.</p>
                                </div>
                                <Switch
                                    checked={operationsSuspended}
                                    onCheckedChange={(c: boolean) => handleEmergencyToggle(c, 'SUSPEND')}
                                    className="data-[state=checked]:bg-red-600"
                                />
                            </div>
                            <Separator className="bg-red-500/10" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base text-white">Surge Pricing Mode</Label>
                                    <p className="text-sm text-gray-400">Automatically increase all scrap rates by 15% during high demand.</p>
                                </div>
                                <Switch
                                    checked={surgePricing}
                                    onCheckedChange={(c: boolean) => handleEmergencyToggle(c, 'SURGE')}
                                    className="data-[state=checked]:bg-yellow-600"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">General Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Service Radius (km)</Label>
                                <Input type="number" defaultValue="15" className="bg-black/20 border-white/10" />
                                <p className="text-xs text-gray-500">Maximum distance for pickup requests.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label>Time Slots</Label>
                                <Input defaultValue="9:00 AM - 6:00 PM" className="bg-black/20 border-white/10" />
                            </div>
                            <Button className="w-fit bg-white/10 hover:bg-white/20">Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card className="border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Bell className="h-5 w-5" /> Bulk Notifications
                            </CardTitle>
                            <CardDescription>Send push notifications or SMS to user groups.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Audience</Label>
                                <Select value={target} onValueChange={setTarget}>
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL_USERS">All Users</SelectItem>
                                        <SelectItem value="ALL_AGENTS">All Agents</SelectItem>
                                        <SelectItem value="CUSTOMERS_ONLY">Customers Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="bg-black/20 border-white/10 min-h-[100px]"
                                    value={message}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSendNotification} disabled={isSending} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSending ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Notification</>}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Logs Tab */}
                <TabsContent value="logs">
                    <Card className="border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Activity className="h-5 w-5" /> System Activity
                            </CardTitle>
                            <CardDescription>Recent administrative actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-start justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-white">Updated Rate: Newspaper</p>
                                            <p className="text-xs text-gray-500">Changed from ₹12 to ₹14</p>
                                        </div>
                                        <div className="text-right text-xs text-gray-500">
                                            <p>Admin</p>
                                            <p>2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-start justify-between pb-4 border-b border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white">Suspended Agent: John Doe</p>
                                        <p className="text-xs text-gray-500">Reason: Repeated cancellations</p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <p>SuperAdmin</p>
                                        <p>5 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Support Tab */}
                <TabsContent value="support">
                    <Card className="border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <LifeBuoy className="h-5 w-5" /> Support Tickets
                            </CardTitle>
                            <CardDescription>User inquiries and complaints.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                No open tickets.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
