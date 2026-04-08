'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAgentAction, getAgentsAction, toggleUserStatusAction, updateAgentVehicleAction, getAvailableFleetsAction } from '@/app/actions';
import { addFundsToAgentAction } from '@/app/wallet-actions';
import { AuthUser } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import { AgentDetailView } from '@/components/admin/agents/agent-detail-view';
import { AgentsTable } from '@/components/admin/agents/agents-table';

export default function AgentManagementPage() {
    const [agents, setAgents] = useState<AuthUser[]>([]);
    const [fleets, setFleets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialogs
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<AuthUser | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user: currentUser } = useAuthStore();

    // New Agent Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleName: '',
        vehiclePlate: '',
        vehicleType: 'Bike'
    });

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        setIsLoading(true);
        try {
            const [data, fleetData] = await Promise.all([
                getAgentsAction(),
                getAvailableFleetsAction()
            ]);
            setAgents(data);
            setFleets(fleetData);
        } catch (error) {
            toast.error('Failed to load agents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await createAgentAction(formData);
            if (result.success) {
                toast.success('Agent created successfully');
                setIsCreateDialogOpen(false);
                setFormData({ name: '', email: '', phone: '', password: '', vehicleName: '', vehiclePlate: '', vehicleType: 'Bike' });
                loadAgents();
            } else {
                toast.error(result.error || 'Failed to create agent');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAgent = async (agentId: string, updates: any) => {
        try {
            if (updates.status) {
                const res = await toggleUserStatusAction(agentId, updates.status);
                if (!res.success) throw new Error(res.error || "Failed to update status");
                toast.success(`Agent status updated to ${updates.status}`);
            }
            if (updates.fleetId !== undefined) {
                const res = await updateAgentVehicleAction(agentId, updates.fleetId);
                if (!res.success) throw new Error(res.error || "Failed to update vehicle");
                toast.success(`Agent fleet updated`);
                loadAgents(); // Reload to get fresh fleet details
            }

            setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...updates } : a));
            if (selectedAgent?.id === agentId) {
                setSelectedAgent(prev => prev ? { ...prev, ...updates } : null);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAddFundsWrapper = async (agentId: string, amount: number) => {
        if (!currentUser?.id) return;
        const result = await addFundsToAgentAction(currentUser.id, agentId, amount);
        if (result.success) {
            toast.success(`Funds added. New Balance: ₹${result.newBalance}`);
            // Update local
            setAgents(prev => prev.map(a => a.id === agentId ? { ...a, walletBalance: result.newBalance } : a));
            if (selectedAgent?.id === agentId) {
                setSelectedAgent(prev => prev ? { ...prev, walletBalance: result.newBalance } : null);
            }
        } else {
            toast.error(result.error || "Failed to add funds");
            throw new Error(result.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Agent Management</h1>
                    <p className="text-gray-400">Manage field agents and their accounts.</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Add New Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-black">
                        <DialogHeader>
                            <DialogTitle>Add New Agent</DialogTitle>
                            <DialogDescription>
                                Create a new account for a field agent.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateAgent} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Agent Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="agent@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="9876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Initial Password</Label>
                                <Input
                                    id="password"
                                    type="text"
                                    placeholder="Set a strong password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h4 className="font-semibold text-sm text-gray-300">Agent's Vehicle Info</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicleName">Vehicle Name / Model</Label>
                                    <Input
                                        id="vehicleName"
                                        placeholder="e.g. Hero Splendor Plus"
                                        value={formData.vehicleName}
                                        onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehiclePlate">License Plate</Label>
                                    <Input
                                        id="vehiclePlate"
                                        placeholder="e.g. MH-12-AB-1234"
                                        value={formData.vehiclePlate}
                                        onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                                    <select 
                                        id="vehicleType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.vehicleType}
                                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                    >
                                        <option value="Bike">Bike</option>
                                        <option value="Mini Truck">Mini Truck</option>
                                        <option value="Large Truck">Large Truck</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <div>
                        <CardTitle className="text-white">All Agents</CardTitle>
                        <CardDescription className="text-gray-400">List of all registered field agents.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        </div>
                    ) : (
                        <AgentsTable
                            agents={agents}
                            onViewAgent={setSelectedAgent}
                        />
                    )}
                </CardContent>
            </Card>

            <AgentDetailView
                isOpen={!!selectedAgent}
                onClose={() => setSelectedAgent(null)}
                agent={selectedAgent}
                availableFleets={fleets}
                onUpdate={handleUpdateAgent}
                onAddFunds={handleAddFundsWrapper}
            />
        </div>
    );
}
