'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Truck, Plus, Loader2, Search, LayoutGrid, List, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createFleetVehicleAction, getFleetVehiclesAction, updateFleetVehicleAction, deleteFleetVehicleAction } from '@/app/actions';

export default function FleetManagementPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    
    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    const [formData, setFormData] = useState({ name: '', licensePlate: '', vehicleType: '', capacityKg: '', status: 'ACTIVE' });

    useEffect(() => { load() }, []);

    useEffect(() => {
        const lowerQ = searchQuery.toLowerCase();
        setFilteredVehicles(vehicles.filter(v => 
            v.name?.toLowerCase().includes(lowerQ) || 
            v.licensePlate?.toLowerCase().includes(lowerQ) || 
            v.vehicleType?.toLowerCase().includes(lowerQ)
        ));
    }, [searchQuery, vehicles]);
    
    async function load() {
        setLoading(true);
        const data = await getFleetVehiclesAction();
        setVehicles(data as any);
        setLoading(false);
    }

    async function handleAdd() {
        if (!formData.name || !formData.licensePlate) return toast.error('Name & License Plate are required');
        const res = await createFleetVehicleAction({
            ...formData,
            capacityKg: formData.capacityKg ? Number(formData.capacityKg) : undefined
        });
        if (res.success) {
            toast.success('Vehicle added');
            setIsAddOpen(false);
            setFormData({ name: '', licensePlate: '', vehicleType: '', capacityKg: '', status: 'ACTIVE' });
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleEditSave() {
        if (!selectedVehicle) return;
        const res = await updateFleetVehicleAction(selectedVehicle.id, {
            name: formData.name,
            licensePlate: formData.licensePlate,
            vehicleType: formData.vehicleType,
            capacityKg: formData.capacityKg ? Number(formData.capacityKg) : null,
            status: formData.status
        });
        
        if (res.success) {
            toast.success('Vehicle updated');
            setIsEditOpen(false);
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to permanently delete this vehicle?")) return;
        const res = await deleteFleetVehicleAction(id);
        if (res.success) {
            toast.success('Vehicle deleted');
            load();
        } else {
            toast.error(res.error);
        }
    }

    const openEdit = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setFormData({ name: vehicle.name, licensePlate: vehicle.licensePlate, vehicleType: vehicle.vehicleType || '', capacityKg: vehicle.capacityKg || '', status: vehicle.status || 'ACTIVE' });
        setIsEditOpen(true);
    };

    const openView = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setIsViewOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Fleet Management</h1>
                    <p className="text-gray-400">Track and manage your operational vehicles and drivers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search fleet..." 
                            className="bg-white/5 border-white/10 text-white pl-9 w-[200px]"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-1">
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400'}`} onClick={() => setViewMode('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'}`} onClick={() => setViewMode('grid')}>
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 border-0" onClick={() => {
                        setFormData({ name: '', licensePlate: '', vehicleType: '', capacityKg: '', status: 'ACTIVE' });
                        setIsAddOpen(true);
                    }}>
                        <Plus className="h-4 w-4" /> Add Vehicle
                    </Button>
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Add New Vehicle</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Vehicle Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Truck 12" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">License Plate</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} placeholder="e.g. TN-00-A-0000" />
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm text-gray-400">Vehicle Type</label>
                                <Input className="bg-white/5 border-white/10 text-white" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} placeholder="e.g. Mini Truck" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm text-gray-400">Weight Capacity (kg)</label>
                                <Input type="number" className="bg-white/5 border-white/10 text-white" value={formData.capacityKg} onChange={e => setFormData({...formData, capacityKg: e.target.value})} placeholder="e.g. 500" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white border-0">Save Vehicle</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Edit Vehicle</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Vehicle Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">License Plate</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} />
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm text-gray-400">Vehicle Type</label>
                                <Input className="bg-white/5 border-white/10 text-white" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} />
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm text-gray-400">Weight Cap (kg)</label>
                                <Input type="number" className="bg-white/5 border-white/10 text-white" value={formData.capacityKg} onChange={e => setFormData({...formData, capacityKg: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Status</label>
                            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSave} className="bg-blue-600 hover:bg-blue-700 text-white border-0">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Vehicle Details</DialogTitle></DialogHeader>
                    {selectedVehicle && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-500">ID</label><p className="text-sm font-mono">{selectedVehicle.id}</p></div>
                                <div><label className="text-xs text-gray-500">Status</label><p className="text-sm">{selectedVehicle.status}</p></div>
                                <div><label className="text-xs text-gray-500">Name</label><p className="text-sm">{selectedVehicle.name}</p></div>
                                <div><label className="text-xs text-gray-500">License Plate</label><p className="text-sm">{selectedVehicle.licensePlate}</p></div>
                                <div><label className="text-xs text-gray-500">Vehicle Type</label><p className="text-sm">{selectedVehicle.vehicleType || 'N/A'}</p></div>
                                <div><label className="text-xs text-gray-500">Capacity</label><p className="text-sm">{selectedVehicle.capacityKg ? `${selectedVehicle.capacityKg} kg` : 'N/A'}</p></div>
                                <div><label className="text-xs text-gray-500">Currently Assigned Agent</label><p className="text-sm">{selectedVehicle.agent?.name || 'None'}</p></div>
                                <div><label className="text-xs text-gray-500">Date Added</label><p className="text-sm">{new Date(selectedVehicle.createdAt).toLocaleString()}</p></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Total Vehicles</CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{vehicles.length}</div>
                        <p className="text-xs text-gray-400 mt-1">Active fleet</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-white">Active Dispatch</CardTitle>
                    <CardDescription className="text-gray-400">Live vehicle locations and current capacity.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-green-500" /></div> : filteredVehicles.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-gray-400 text-center">
                            <div><Truck className="h-10 w-10 mx-auto mb-4 opacity-50" /><p>No vehicles found.</p></div>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-black/20">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Vehicle</th>
                                        <th className="px-4 py-3">License Plate</th>
                                        <th className="px-4 py-3">Capacity</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVehicles.map(v => (
                                        <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                                <div className="h-8 w-8 bg-blue-500/10 rounded flex items-center justify-center"><Truck className="h-4 w-4 text-blue-400" /></div>
                                                {v.name}
                                                <span className="text-xs text-gray-500 ml-2">({v.vehicleType})</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{v.licensePlate}</td>
                                            <td className="px-4 py-3 text-gray-400">{v.capacityKg ? `${v.capacityKg} kg` : '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] px-2 py-1 rounded-full ${v.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{v.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => openView(v)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-400" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVehicles.map((v: any) => (
                                <div key={v.id} className="p-4 bg-black/20 border border-white/5 rounded-lg flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                                                <Truck className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{v.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-400">{v.vehicleType}</p>
                                                    {v.capacityKg && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">{v.capacityKg}kg limit</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{v.status}</span>
                                    </div>
                                    <div className="bg-black/40 p-2 rounded text-center text-sm font-mono text-gray-300 border border-white/5">
                                        {v.licensePlate}
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                                        <span className="text-xs text-gray-500">Agent: {v.agent?.name || 'Unassigned'}</span>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => openView(v)}><Eye className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-400" onClick={() => openEdit(v)}><Pencil className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-400" onClick={() => handleDelete(v.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
