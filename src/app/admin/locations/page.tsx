'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map as MapIcon, Plus, Loader2, Search, LayoutGrid, List, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createLocationZoneAction, getLocationZonesAction, updateLocationZoneAction, deleteLocationZoneAction } from '@/app/actions';
import dynamic from 'next/dynamic';

const MapViewer = dynamic(() => import('@/components/admin/MapViewer'), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

export default function LocationsManagementPage() {
    const [zones, setZones] = useState<any[]>([]);
    const [filteredZones, setFilteredZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
    
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<any>(null);

    const [formData, setFormData] = useState({ name: '', region: '', status: 'ACTIVE', lat: '', lng: '', radiusKm: '' });

    useEffect(() => { load() }, []);

    useEffect(() => {
        const lowerQ = searchQuery.toLowerCase();
        setFilteredZones(zones.filter(z => 
            z.name?.toLowerCase().includes(lowerQ) || 
            z.region?.toLowerCase().includes(lowerQ)
        ));
    }, [searchQuery, zones]);
    
    async function load() {
        setLoading(true);
        const data = await getLocationZonesAction();
        setZones(data as any);
        setLoading(false);
    }

    async function handleAdd() {
        if (!formData.name || !formData.region) return toast.error('Name & Region are required');
        
        const payload = {
            ...formData,
            lat: formData.lat ? parseFloat(formData.lat) : undefined,
            lng: formData.lng ? parseFloat(formData.lng) : undefined,
            radiusKm: formData.radiusKm ? parseFloat(formData.radiusKm) : undefined
        };
        const res = await createLocationZoneAction(payload as any);
        
        if (res.success) {
            toast.success('Zone added');
            setIsAddOpen(false);
            setFormData({ name: '', region: '', status: 'ACTIVE', lat: '', lng: '', radiusKm: '' });
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleEditSave() {
        if (!selectedZone) return;
        const payload = {
            ...formData,
            lat: formData.lat ? parseFloat(formData.lat) : undefined,
            lng: formData.lng ? parseFloat(formData.lng) : undefined,
            radiusKm: formData.radiusKm ? parseFloat(formData.radiusKm) : undefined
        };
        const res = await updateLocationZoneAction(selectedZone.id, payload as any);
        
        if (res.success) {
            toast.success('Zone updated');
            setIsEditOpen(false);
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to permanently delete this coverage zone?")) return;
        const res = await deleteLocationZoneAction(id);
        if (res.success) {
            toast.success('Zone deleted');
            load();
        } else {
            toast.error(res.error);
        }
    }

    const openEdit = (zone: any) => {
        setSelectedZone(zone);
        setFormData({ 
            name: zone.name, 
            region: zone.region, 
            status: zone.status || 'ACTIVE',
            lat: zone.lat?.toString() || '',
            lng: zone.lng?.toString() || '',
            radiusKm: zone.radiusKm?.toString() || ''
        });
        setIsEditOpen(true);
    };

    const openView = (zone: any) => {
        setSelectedZone(zone);
        setIsViewOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Locations & Territories</h1>
                    <p className="text-gray-400">Configure pickup zones, coverage boundaries, and pricing regions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search regions..." 
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
                        setFormData({ name: '', region: '', status: 'ACTIVE', lat: '', lng: '', radiusKm: '' });
                        setIsAddOpen(true);
                    }}>
                        <Plus className="h-4 w-4" /> Add Region
                    </Button>
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Add New Operating Region</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Zone Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. South District" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Broad Region/City</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} placeholder="e.g. Chennai" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Center Latitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} placeholder="e.g. 13.0827" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Center Longitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} placeholder="e.g. 80.2707" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Coverage Radius (KM)</label>
                            <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.radiusKm} onChange={e => setFormData({...formData, radiusKm: e.target.value})} placeholder="e.g. 15" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white border-0">Save Region</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Edit Region</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Zone Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Broad Region/City</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Center Latitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Center Longitude</label>
                                <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Coverage Radius (KM)</label>
                            <Input type="number" step="any" className="bg-white/5 border-white/10 text-white" value={formData.radiusKm} onChange={e => setFormData({...formData, radiusKm: e.target.value})} />
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
                    <DialogHeader><DialogTitle>Zone Configuration</DialogTitle></DialogHeader>
                    {selectedZone && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                <div><label className="text-xs text-gray-500">ID</label><p className="text-sm font-mono">{selectedZone.id}</p></div>
                                <div><label className="text-xs text-gray-500">Status</label><p className="text-sm">{selectedZone.status}</p></div>
                                <div><label className="text-xs text-gray-500">Zone Name</label><p className="text-sm font-medium">{selectedZone.name}</p></div>
                                <div><label className="text-xs text-gray-500">Parent Region</label><p className="text-sm text-emerald-200">{selectedZone.region}</p></div>
                                <div><label className="text-xs text-gray-500">Coordinates</label><p className="text-sm font-mono text-gray-300">{selectedZone.lat ? `${selectedZone.lat}, ${selectedZone.lng}` : 'Not set'}</p></div>
                                <div><label className="text-xs text-gray-500">Radius</label><p className="text-sm">{selectedZone.radiusKm ? `${selectedZone.radiusKm} KM` : 'N/A'}</p></div>
                                <div><label className="text-xs text-gray-500">Created</label><p className="text-sm">{new Date(selectedZone.createdAt).toLocaleDateString()}</p></div>
                            </div>
                            <div className="h-48 w-full border border-white/10 rounded overflow-hidden">
                                {selectedZone.lat && selectedZone.lng ? (
                                    <MapViewer 
                                        center={[selectedZone.lat, selectedZone.lng]}
                                        zoom={12}
                                        locations={[{
                                            id: selectedZone.id,
                                            lat: selectedZone.lat,
                                            lng: selectedZone.lng,
                                            name: selectedZone.name,
                                            radiusKm: selectedZone.radiusKm,
                                            color: '#10b981'
                                        }]} 
                                    />
                                ) : (
                                    <div className="h-full w-full bg-white/5 flex items-center justify-center text-gray-500 text-sm">
                                        No center coordinates set for this zone.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Regions</CardTitle>
                        <MapIcon className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{zones.length}</div>
                        <p className="text-xs text-gray-400 mt-1">Configured service areas</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-white">Coverage Map</CardTitle>
                    <CardDescription className="text-gray-400">Geospatial overview of operations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" /></div> : filteredZones.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-gray-400 text-center">
                            <div><MapIcon className="h-10 w-10 mx-auto mb-4 opacity-50" /><p>No areas found.</p></div>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-black/20">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Zone</th>
                                        <th className="px-4 py-3">Region</th>
                                        <th className="px-4 py-3 border-l border-white/5">Status</th>
                                        <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredZones.map(z => (
                                        <tr key={z.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                                <div className="h-8 w-8 bg-emerald-500/10 rounded flex items-center justify-center"><MapIcon className="h-4 w-4 text-emerald-400" /></div>
                                                {z.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{z.region}</td>
                                            <td className="px-4 py-3 border-l border-white/5">
                                                 <span className={`text-[10px] px-2 py-0.5 rounded-full ${z.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{z.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => openView(z)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-400" onClick={() => openEdit(z)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400" onClick={() => handleDelete(z.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : viewMode === 'grid' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredZones.map((z: any) => (
                                <div key={z.id} className="p-4 bg-black/20 border border-white/5 rounded-lg flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-4 shrink-0">
                                        <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <MapIcon className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-white font-medium truncate">{z.name}</p>
                                            <p className="text-sm text-gray-400 truncate">{z.region}</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${z.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {z.status}
                                        </span>
                                         <div className="flex gap-1 flex-row-reverse">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-400" onClick={() => handleDelete(z.id)}><Trash2 className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-400" onClick={() => openEdit(z)}><Pencil className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => openView(z)}><Eye className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[500px] w-full border border-white/10 rounded-lg overflow-hidden bg-black/20 text-black">
                            <MapViewer 
                                locations={filteredZones
                                    .filter(z => z.lat && z.lng)
                                    .map(z => ({
                                        id: z.id,
                                        lat: parseFloat(z.lat),
                                        lng: parseFloat(z.lng),
                                        name: z.name,
                                        description: z.region,
                                        radiusKm: z.radiusKm ? parseFloat(z.radiusKm) : undefined,
                                        color: '#10b981'
                                    }))} 
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
