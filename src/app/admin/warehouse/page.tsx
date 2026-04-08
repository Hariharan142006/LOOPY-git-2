'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Warehouse, Plus, Loader2, Search, LayoutGrid, List, Pencil, Trash2, Eye, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createWarehouseAction, getWarehousesAction, updateWarehouseAction, deleteWarehouseAction } from '@/app/actions';
import dynamic from 'next/dynamic';

const MapViewer = dynamic(() => import('@/components/admin/MapViewer'), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

export default function WarehouseManagementPage() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
    
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

    const [formData, setFormData] = useState({ name: '', location: '', capacity: '', status: 'ACTIVE', lat: '', lng: '' });

    useEffect(() => { load() }, []);

    useEffect(() => {
        const lowerQ = searchQuery.toLowerCase();
        setFilteredWarehouses(warehouses.filter(w => 
            w.name?.toLowerCase().includes(lowerQ) || 
            w.location?.toLowerCase().includes(lowerQ)
        ));
    }, [searchQuery, warehouses]);
    
    async function load() {
        setLoading(true);
        const data = await getWarehousesAction();
        setWarehouses(data as any);
        setLoading(false);
    }

    async function handleAdd() {
        const payload = { 
            ...formData, 
            capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
            lat: formData.lat ? parseFloat(formData.lat) : undefined,
            lng: formData.lng ? parseFloat(formData.lng) : undefined
        };
        const res = await createWarehouseAction(payload as any);
        
        if (res.success) {
            toast.success('Warehouse added');
            setIsAddOpen(false);
            setFormData({ name: '', location: '', capacity: '', status: 'ACTIVE', lat: '', lng: '' });
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleEditSave() {
        if (!selectedWarehouse) return;
        const res = await updateWarehouseAction(selectedWarehouse.id, {
            name: formData.name,
            location: formData.location,
            capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
            status: formData.status,
            lat: formData.lat ? parseFloat(formData.lat) : undefined,
            lng: formData.lng ? parseFloat(formData.lng) : undefined
        } as any);
        
        if (res.success) {
            toast.success('Facility updated');
            setIsEditOpen(false);
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to permanently delete this warehouse facility?")) return;
        const res = await deleteWarehouseAction(id);
        if (res.success) {
            toast.success('Facility deleted');
            load();
        } else {
            toast.error(res.error);
        }
    }

    const openEdit = (warehouse: any) => {
        setSelectedWarehouse(warehouse);
        setFormData({ 
            name: warehouse.name, 
            location: warehouse.location, 
            capacity: warehouse.capacity?.toString() || '', 
            status: warehouse.status || 'ACTIVE',
            lat: warehouse.lat?.toString() || '',
            lng: warehouse.lng?.toString() || ''
        });
        setIsEditOpen(true);
    };

    const openView = (warehouse: any) => {
        setSelectedWarehouse(warehouse);
        setIsViewOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Warehouse Inventory</h1>
                    <p className="text-gray-400">Manage storage hubs, aggregate stock, and processing capacity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search hubs..." 
                            className="bg-white/5 border-white/10 text-white pl-9 w-[200px]"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-1">
                        <Button variant="ghost" size="icon" title="List View" className={`h-8 w-8 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400'}`} onClick={() => setViewMode('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Grid View" className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'}`} onClick={() => setViewMode('grid')}>
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Map View" className={`h-8 w-8 ${viewMode === 'map' ? 'bg-white/10 text-white' : 'text-gray-400'}`} onClick={() => setViewMode('map')}>
                            <MapIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 border-0" onClick={() => {
                        setFormData({ name: '', location: '', capacity: '', status: 'ACTIVE', lat: '', lng: '' });
                        setIsAddOpen(true);
                    }}>
                        <Plus className="h-4 w-4" /> Add Warehouse
                    </Button>
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Add New Facility</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Facility Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. North Hub" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Location</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. 123 Industrial Area" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Capacity (Tons)</label>
                            <Input type="number" className="bg-white/5 border-white/10 text-white" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="e.g. 500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Latitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} placeholder="e.g. 19.0760" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Longitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} placeholder="e.g. 72.8777" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white border-0">Save Facility</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Edit Facility</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Facility Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Location</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Capacity (Tons)</label>
                            <Input type="number" className="bg-white/5 border-white/10 text-white" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Latitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Longitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} />
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
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
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
                    <DialogHeader><DialogTitle>Facility Logistics</DialogTitle></DialogHeader>
                    {selectedWarehouse && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-500">ID</label><p className="text-sm font-mono">{selectedWarehouse.id}</p></div>
                                <div><label className="text-xs text-gray-500">Status</label><p className="text-sm">{selectedWarehouse.status}</p></div>
                                <div className="col-span-2"><label className="text-xs text-gray-500">Facility Name</label><p className="text-sm font-medium">{selectedWarehouse.name}</p></div>
                                <div className="col-span-2"><label className="text-xs text-gray-500">Address/Location</label><p className="text-sm text-orange-200">{selectedWarehouse.location}</p></div>
                                <div><label className="text-xs text-gray-500">Storage Capacity</label><p className="text-sm font-mono">{selectedWarehouse.capacity ? `${selectedWarehouse.capacity} Tons` : 'N/A'}</p></div>
                                <div><label className="text-xs text-gray-500">Coordinates</label><p className="text-sm font-mono text-gray-300">{selectedWarehouse.lat ? `${selectedWarehouse.lat}, ${selectedWarehouse.lng}` : 'Not set'}</p></div>
                                <div><label className="text-xs text-gray-500">Commission Date</label><p className="text-sm">{new Date(selectedWarehouse.createdAt).toLocaleDateString()}</p></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Active Facilities</CardTitle>
                        <Warehouse className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{warehouses.length}</div>
                        <p className="text-xs text-gray-400 mt-1">Operational hubs</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-white">Storage Overview</CardTitle>
                    <CardDescription className="text-gray-400">Current accumulation of collected materials.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-500" /></div> : filteredWarehouses.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-gray-400 text-center">
                            <div><Warehouse className="h-10 w-10 mx-auto mb-4 opacity-50" /><p>No storage facilities found.</p></div>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-black/20">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Facility</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3 border-l border-white/5">Capacity (T)</th>
                                        <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWarehouses.map(w => (
                                        <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                                <div className="h-8 w-8 bg-orange-500/10 rounded flex items-center justify-center"><Warehouse className="h-4 w-4 text-orange-400" /></div>
                                                {w.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300 truncate max-w-[200px]">{w.location}</td>
                                            <td className="px-4 py-3 font-mono text-gray-400 border-l border-white/5">{w.capacity || '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => openView(w)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-400" onClick={() => openEdit(w)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400" onClick={() => handleDelete(w.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredWarehouses.map((w: any) => (
                                <div key={w.id} className="p-4 bg-black/20 border border-white/5 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Warehouse className="h-5 w-5 text-orange-400" />
                                        </div>
                                        <div className="flex-1 w-full overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <p className="text-white font-medium truncate">{w.name}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${w.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{w.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 truncate mt-1">{w.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <span className="text-xs font-mono text-orange-200/60 bg-orange-500/10 px-2 py-1 rounded">
                                            {w.capacity ? `${w.capacity} Tons` : 'Capacity limit N/A'}
                                        </span>
                                        <div className="flex gap-1 flex-row-reverse">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-400 bg-black/40" onClick={() => handleDelete(w.id)}><Trash2 className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-400 bg-black/40" onClick={() => openEdit(w)}><Pencil className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white bg-black/40" onClick={() => openView(w)}><Eye className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[500px] w-full border border-white/10 rounded-lg overflow-hidden bg-black/20">
                            <MapViewer 
                                locations={filteredWarehouses
                                    .filter(w => w.lat && w.lng)
                                    .map(w => ({
                                        id: w.id,
                                        lat: parseFloat(w.lat),
                                        lng: parseFloat(w.lng),
                                        name: w.name,
                                        description: w.location,
                                        color: '#f97316'
                                    }))} 
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
