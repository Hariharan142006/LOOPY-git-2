'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { getAgentStatsAction, updateUserProfileAction } from '@/app/profile-actions';
import { Loader2, ArrowLeft, Wallet, CheckCircle, Clock, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AgentProfilePage() {
    const { user, logout } = useAuthStore();
    const [stats, setStats] = useState({ completedThisMonth: 0, pendingOrders: 0, walletBalance: 0 });
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadStats();
            setFormData({ name: user.name || '', phone: user.phone || '' });
        }
    }, [user?.id]);

    const loadStats = async () => {
        if (!user?.id) return;
        const data = await getAgentStatsAction(user.id);
        setStats(data);
    };

    const handleUpdate = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            await updateUserProfileAction(user.id, formData);
            toast.success("Details updated");
        } catch (e) {
            toast.error("Failed update");
        } finally {
            setIsLoading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-4">
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/agent/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
                </div>

                {/* Wallet & Stats */}
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-full">
                                <Wallet className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Wallet Balance</p>
                                <p className="text-3xl font-bold">₹{Math.floor(stats.walletBalance)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1 text-gray-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs">Completed (Month)</span>
                                </div>
                                <p className="text-2xl font-semibold">{stats.completedThisMonth}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1 text-gray-400">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">Pending Orders</span>
                                </div>
                                <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <Button onClick={handleUpdate} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Update Details'}
                        </Button>
                    </CardContent>
                </Card>

                <Button
                    variant="outline"
                    className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm"
                    onClick={() => logout()}
                >
                    <LogOut className="h-4 w-4" />
                    Logout from Portal
                </Button>
            </div>
        </div>
    );
}
