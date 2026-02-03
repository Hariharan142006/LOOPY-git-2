'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Shield, Ban, CheckCircle, UserCog, Wallet, Plus, Mail, Phone, User, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUsersAction, toggleUserStatusAction, deleteUserAction, changeUserRoleAction, createCustomerAction } from '@/app/actions';
import { useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsersPage() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Create Customer State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });


    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter((user) =>
                (user.name?.toLowerCase().includes(query) || '') ||
                (user.email?.toLowerCase().includes(query) || '') ||
                (user.role?.toLowerCase().includes(query) || '')
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsersAction();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus?: string) => {
        const newStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
        try {
            const result = await toggleUserStatusAction(userId, newStatus);
            if (result.success) {
                toast.success(`User ${newStatus === 'BLOCKED' ? 'blocked' : 'unblocked'}`);
                loadUsers();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            const result = await deleteUserAction(userId);
            if (result.success) {
                toast.success('User deleted successfully');
                loadUsers();
            } else {
                toast.error('Failed to delete user');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            const result = await changeUserRoleAction(userId, newRole);
            if (result.success) {
                toast.success(`User role updated to ${newRole}`);
                loadUsers();
            } else {
                toast.error('Failed to update role');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await createCustomerAction(formData);
            if (result.success) {
                toast.success('Customer added successfully');
                setIsDialogOpen(false);
                setFormData({ name: '', email: '', phone: '', password: '' });
                loadUsers();
            } else {
                toast.error(result.error || 'Failed to add customer');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Admin</Badge>;
            case 'AGENT':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Agent</Badge>;
            case 'CUSTOMER':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Customer</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
                    <p className="text-gray-400">View and manage all registered users.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-black">
                        <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                            <DialogDescription>
                                Manually create a customer account.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateCustomer} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="c-name">Full Name</Label>
                                <Input id="c-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="c-email">Email</Label>
                                <Input id="c-email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="c-phone">Phone</Label>
                                <Input id="c-phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="c-password">Password</Label>
                                <Input id="c-password" type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Create Customer'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-white">All Users</CardTitle>
                            <CardDescription className="text-gray-400">Total registered users: {users.length}</CardDescription>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No users found matching your criteria.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-gray-300">User</TableHead>
                                    <TableHead className="text-gray-300">Contact</TableHead>
                                    <TableHead className="text-gray-300">Role</TableHead>
                                    <TableHead className="text-gray-300">Status</TableHead>
                                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05, duration: 0.2 }}
                                            className="border-white/10 hover:bg-white/5 data-[state=selected]:bg-muted"
                                        >
                                            <TableCell className="font-medium text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
                                                        {user.role === 'ADMIN' ? <Shield className="h-4 w-4 text-red-400" /> : <User className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{user.name || 'Unnamed User'}</span>
                                                        <span className="text-xs text-gray-500 md:hidden">{user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 opacity-50" /> {user.email || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 opacity-50" /> {user.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getRoleBadge(user.role)}
                                            </TableCell>
                                            <TableCell>
                                                {user.status === 'BLOCKED' ? (
                                                    <Badge variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Blocked</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5">Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.role !== 'ADMIN' && (
                                                    <div className="flex justify-end gap-2">
                                                        {user.role === 'CUSTOMER' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleChangeRole(user.id, 'AGENT')}
                                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                                title="Promote to Agent"
                                                            >
                                                                <Badge className="bg-blue-500/20 text-blue-300 text-[10px] pointer-events-none">+ Agent</Badge>
                                                            </Button>
                                                        )}
                                                        {user.role === 'AGENT' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleChangeRole(user.id, 'CUSTOMER')}
                                                                className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
                                                                title="Demote to Customer"
                                                            >
                                                                <Badge variant="outline" className="border-gray-500 text-gray-400 text-[10px] pointer-events-none">To Cust</Badge>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(user.id, user.status)}
                                                            className={user.status === 'BLOCKED' ? "text-green-400 hover:text-green-300 hover:bg-green-500/10" : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"}
                                                            title={user.status === 'BLOCKED' ? "Unblock User" : "Block User"}
                                                        >
                                                            {user.status === 'BLOCKED' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
