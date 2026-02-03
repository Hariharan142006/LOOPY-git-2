'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Truck, Star, Ban, CheckCircle, Wallet } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AgentDetailViewProps {
    isOpen: boolean;
    onClose: () => void;
    agent: any;
    onUpdate: (agentId: string, updates: any) => Promise<void>;
    onAddFunds: (agentId: string, amount: number) => Promise<void>;
}

export function AgentDetailView({ isOpen, onClose, agent, onUpdate, onAddFunds }: AgentDetailViewProps) {
    const [fundAmount, setFundAmount] = useState('');
    const [isFunding, setIsFunding] = useState(false);

    if (!agent) return null;

    const handleStatusChange = async (newStatus: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED') => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        try {
            await onUpdate(agent.id, { status: newStatus });
            toast.success(`Agent status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleFundSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(fundAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Invalid amount");
            return;
        }

        setIsFunding(true);
        try {
            await onAddFunds(agent.id, amount);
            setFundAmount('');
            // toast success handled by parent usually, but we can do here too? 
            // Parent page logic does it. We assume prop handles it.
        } catch (error) {
            // error handled
        } finally {
            setIsFunding(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[700px] bg-gray-900 border-white/10 text-white max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="bg-green-500/20 text-green-400 p-1.5 rounded-full">
                                <User className="h-5 w-5" />
                            </span>
                            {agent.name}
                        </DialogTitle>
                        <Badge variant={agent.isOnline ? "default" : "secondary"} className={agent.isOnline ? "bg-green-600" : "bg-gray-600"}>
                            {agent.isOnline ? "Online" : "Offline"}
                        </Badge>
                    </div>
                    <DialogDescription>
                        Agent Profile & Management
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    {/* Left Col: Profile & Contact */}
                    <div className="md:col-span-1 space-y-6 border-r border-white/10 pr-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="truncate" title={agent.email}>{agent.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>{agent.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span>{agent.city || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
                            <div className="flex flex-col gap-2">
                                <Badge variant="outline" className="w-fit justify-center border-white/20">
                                    Role: {agent.role}
                                </Badge>
                                <Badge variant="outline" className={`w-fit justify-center ${agent.status === 'BLOCKED' ? 'border-red-500 text-red-500' :
                                    agent.status === 'SUSPENDED' ? 'border-yellow-500 text-yellow-500' :
                                        'border-green-500 text-green-500'
                                    }`}>
                                    Account: {agent.status || 'ACTIVE'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Stats & Actions */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                                <div className="text-xs text-gray-400 mb-1">Total Pickups</div>
                                <div className="text-xl font-bold flex items-center justify-center gap-1">
                                    <Truck className="h-4 w-4 text-blue-400" />
                                    {agent.totalPickups || 0}
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                                <div className="text-xs text-gray-400 mb-1">Rating</div>
                                <div className="text-xl font-bold flex items-center justify-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    {agent.rating || "4.8"}
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                                <div className="text-xs text-gray-400 mb-1">Wallet Balance</div>
                                <div className="text-xl font-bold text-green-400">
                                    ₹{Math.floor(agent.walletBalance || 0)}
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Wallet Manager */}
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <Wallet className="h-4 w-4" /> Add Funds
                            </h3>
                            <form onSubmit={handleFundSubmit} className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Amount (₹)"
                                    className="bg-black/20 border-white/10"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                />
                                <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700" disabled={isFunding}>
                                    {isFunding ? "Adding..." : "Add"}
                                </Button>
                            </form>
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Account Actions */}
                        <div>
                            <h3 className="font-semibold text-white mb-3">Account Actions</h3>
                            <div className="flex gap-2 flex-wrap">
                                {agent.status !== 'ACTIVE' && (
                                    <Button
                                        variant="outline"
                                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                        onClick={() => handleStatusChange('ACTIVE')}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Activate
                                    </Button>
                                )}
                                {agent.status !== 'SUSPENDED' && (
                                    <Button
                                        variant="outline"
                                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                                        onClick={() => handleStatusChange('SUSPENDED')}
                                    >
                                        Suspend
                                    </Button>
                                )}
                                {agent.status !== 'BLOCKED' && (
                                    <Button
                                        variant="destructive"
                                        className="bg-red-900/50 border border-red-500/50 hover:bg-red-900/80"
                                        onClick={() => handleStatusChange('BLOCKED')}
                                    >
                                        <Ban className="mr-2 h-4 w-4" /> Block Account
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
