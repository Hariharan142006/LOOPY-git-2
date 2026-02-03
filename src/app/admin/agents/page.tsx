'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAgentAction, getAgentsAction } from '@/app/actions';
import { addFundsToAgentAction } from '@/app/wallet-actions';
import { AuthUser } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import { AgentDetailView } from '@/components/admin/agents/agent-detail-view';
import { AgentsTable } from '@/components/admin/agents/agents-table';

export default function AgentManagementPage() {
    const [agents, setAgents] = useState<AuthUser[]>([]);
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
        password: ''
    });

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        setIsLoading(true);
        try {
            const data = await getAgentsAction();
            setAgents(data);
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
                setFormData({ name: '', email: '', phone: '', password: '' });
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
        // Mock update logic
        // We'll optimistically update locally
        // In real app, we'd call an updateAgentStatusAction(agentId, updates.status)

        // Check if status changed
        if (updates.status) {
            // We can mock the success
            toast.success(`Agent status updated to ${updates.status}`);
        } else {
            toast.success("Agent updated");
        }

        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...updates } : a));
        if (selectedAgent?.id === agentId) {
            setSelectedAgent(prev => prev ? { ...prev, ...updates } : null);
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
                onUpdate={handleUpdateAgent}
                onAddFunds={handleAddFundsWrapper}
            />
        </div>
    );
}
