'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MapPin, User, Truck, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface PickupRequest {
    id: string;
    status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    user: {
        name: string;
        phone: string;
    };
    agent?: {
        name: string;
        phone: string;
    };
    address: {
        street: string;
        city: string;
    };
    scheduledAt: string;
    items: { item: { name: string; unit: string }; quantity: number }[];
    totalAmount?: number;
}

interface RequestsTableProps {
    requests: PickupRequest[];
    onAssign: (id: string) => void;
    onCancel: (id: string) => void;
    onView: (id: string) => void;
}

export function RequestsTable({ requests, onAssign, onCancel, onView }: RequestsTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'ASSIGNED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'IN_PROGRESS': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">ID & Time</TableHead>
                        <TableHead className="text-gray-400">Customer</TableHead>
                        <TableHead className="text-gray-400">Location</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Agent</TableHead>
                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                No pickup requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((req) => (
                            <TableRow key={req.id} className="border-white/10 hover:bg-white/5">
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-mono text-xs text-gray-500">#{req.id.slice(-6)}</span>
                                        <div className="flex items-center gap-1 text-sm text-gray-300">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(req.scheduledAt), 'MMM d, h:mm a')}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{req.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">{req.user.name}</span>
                                            <span className="text-xs text-gray-500">{req.user.phone}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-1 max-w-[200px]">
                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-300 truncate" title={req.address.street}>
                                            {req.address.street}, {req.address.city}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getStatusColor(req.status)}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {req.agent ? (
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-white">{req.agent.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {req.status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                                                onClick={() => onAssign(req.id)}
                                            >
                                                Assign
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-gray-400 hover:text-white"
                                            onClick={() => onView(req.id)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
