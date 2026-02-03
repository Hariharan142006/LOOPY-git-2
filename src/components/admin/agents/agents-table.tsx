'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AuthUser } from "@/lib/types";

interface AgentsTableProps {
    agents: AuthUser[];
    onViewAgent: (agent: AuthUser) => void;
}

export function AgentsTable({ agents, onViewAgent }: AgentsTableProps) {
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const filteredAgents = agents.filter(agent => {
        const matchesSearch =
            (agent.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (agent.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (agent.phone || '').includes(search);

        if (!matchesSearch) return false;

        if (filter === 'ALL') return true;
        if (filter === 'ACTIVE') return agent.status === 'ACTIVE' || !agent.status; // Default active if undefined
        if (filter === 'SUSPENDED') return agent.status === 'SUSPENDED';
        if (filter === 'BLOCKED') return agent.status === 'BLOCKED';
        if (filter === 'ONLINE') return agent.isOnline;

        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Tabs defaultValue="ALL" onValueChange={setFilter} className="w-[400px]">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="ALL">All</TabsTrigger>
                        <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                        <TabsTrigger value="SUSPENDED">Suspended</TabsTrigger>
                        {/* <TabsTrigger value="ONLINE">Online</TabsTrigger> */}
                    </TabsList>
                </Tabs>

                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search Agents..."
                        className="pl-9 bg-black/20 border-white/10 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Contact</TableHead>
                            <TableHead className="text-gray-400">Role</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-right text-gray-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAgents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No agents found matching current filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAgents.map((agent) => (
                                <TableRow key={agent.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                                <User className="h-4 w-4" />
                                            </div>
                                            {agent.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {agent.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {agent.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
                                            {agent.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            {agent.isOnline ? (
                                                <Badge className="bg-green-600 hover:bg-green-700 text-white border-none w-fit">
                                                    Online
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-600 w-fit">
                                                    Offline
                                                </Badge>
                                            )}
                                            {agent.status && agent.status !== 'ACTIVE' && (
                                                <Badge variant="destructive" className="w-fit text-[10px] px-1 py-0 h-4">
                                                    {agent.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-white"
                                            onClick={() => onViewAgent(agent)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" /> View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
