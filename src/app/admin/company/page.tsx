'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Plus, Loader2, Search, LayoutGrid, List, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCompanyAction, getCompaniesAction, updateCompanyAction, deleteCompanyAction } from '@/app/actions';

export default function CompanyManagementPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    
    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);

    const [formData, setFormData] = useState({ name: '', type: 'PARTNER', contactEmail: '', contactPhone: '' });

    useEffect(() => { load() }, []);

    useEffect(() => {
        const lowerQ = searchQuery.toLowerCase();
        setFilteredCompanies(companies.filter(c => 
            c.name?.toLowerCase().includes(lowerQ) || 
            c.type?.toLowerCase().includes(lowerQ) ||
            c.contactEmail?.toLowerCase().includes(lowerQ)
        ));
    }, [searchQuery, companies]);
    
    async function load() {
        setLoading(true);
        const data = await getCompaniesAction();
        setCompanies(data as any);
        setLoading(false);
    }

    async function handleAdd() {
        if (!formData.name) return toast.error('Name is required');
        const res = await createCompanyAction(formData);
        if (res.success) {
            toast.success('Company added');
            setIsAddOpen(false);
            setFormData({ name: '', type: 'PARTNER', contactEmail: '', contactPhone: '' });
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleEditSave() {
        if (!selectedCompany) return;
        const res = await updateCompanyAction(selectedCompany.id, formData);
        
        if (res.success) {
            toast.success('Company updated');
            setIsEditOpen(false);
            load();
        } else {
            toast.error(res.error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to permanently delete this company?")) return;
        const res = await deleteCompanyAction(id);
        if (res.success) {
            toast.success('Company deleted');
            load();
        } else {
            toast.error(res.error);
        }
    }

    const openEdit = (company: any) => {
        setSelectedCompany(company);
        setFormData({ name: company.name, type: company.type, contactEmail: company.contactEmail || '', contactPhone: company.contactPhone || '' });
        setIsEditOpen(true);
    };

    const openView = (company: any) => {
        setSelectedCompany(company);
        setIsViewOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Company Information</h1>
                    <p className="text-gray-400">Manage B2B partners, franchises, and organizational zones.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search partners..." 
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
                        setFormData({ name: '', type: 'PARTNER', contactEmail: '', contactPhone: '' });
                        setIsAddOpen(true);
                    }}>
                        <Plus className="h-4 w-4" /> Add Company
                    </Button>
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Add New Partner</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Company Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Corp" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Company Type</label>
                            <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white border-white/10 z-[100]">
                                    <SelectItem value="PARTNER">Partner</SelectItem>
                                    <SelectItem value="FRANCHISE">Franchise</SelectItem>
                                    <SelectItem value="CLIENT">Client</SelectItem>
                                    <SelectItem value="VENDOR">Vendor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-4">
                             <div className="space-y-2 flex-1">
                                <label className="text-sm text-gray-400">Contact Email</label>
                                <Input type="email" className="bg-white/5 border-white/10 text-white" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} placeholder="contact@example.com" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm text-gray-400">Contact Phone</label>
                                <Input className="bg-white/5 border-white/10 text-white" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} placeholder="+91..." />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white border-0">Save Company</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-gray-900 text-white border-white/10">
                    <DialogHeader><DialogTitle>Edit Company</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Company Name</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Company Type</label>
                            <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white border-white/10 z-[100]">
                                    <SelectItem value="PARTNER">Partner</SelectItem>
                                    <SelectItem value="FRANCHISE">Franchise</SelectItem>
                                    <SelectItem value="CLIENT">Client</SelectItem>
                                    <SelectItem value="VENDOR">Vendor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Contact Email</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Contact Phone</label>
                            <Input className="bg-white/5 border-white/10 text-white" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
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
                    <DialogHeader><DialogTitle>Company Profile</DialogTitle></DialogHeader>
                    {selectedCompany && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-500">ID</label><p className="text-sm font-mono">{selectedCompany.id}</p></div>
                                <div><label className="text-xs text-gray-500">Type</label><p className="text-sm">{selectedCompany.type}</p></div>
                                <div className="col-span-2"><label className="text-xs text-gray-500">Company Name</label><p className="text-sm font-medium">{selectedCompany.name}</p></div>
                                <div><label className="text-xs text-gray-500">Email</label><p className="text-sm">{selectedCompany.contactEmail || 'N/A'}</p></div>
                                <div><label className="text-xs text-gray-500">Phone</label><p className="text-sm">{selectedCompany.contactPhone || 'N/A'}</p></div>
                                <div><label className="text-xs text-gray-500">Date Added</label><p className="text-sm">{new Date(selectedCompany.createdAt).toLocaleString()}</p></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Total Records</CardTitle>
                        <Building2 className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{companies.length}</div>
                        <p className="text-xs text-gray-400 mt-1">Verified partner entities</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-white">Partner Directory</CardTitle>
                    <CardDescription className="text-gray-400">List of enrolled businesses and associated accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" /></div> : filteredCompanies.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-gray-400 text-center">
                            <div><Building2 className="h-10 w-10 mx-auto mb-4 opacity-50" /><p>No companies found.</p></div>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-black/20">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Company</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map(c => (
                                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                                <div className="h-8 w-8 bg-indigo-500/10 rounded flex items-center justify-center"><Building2 className="h-4 w-4 text-indigo-400" /></div>
                                                {c.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300"><span className="bg-black/40 border border-white/10 px-2 py-1 rounded text-xs">{c.type}</span></td>
                                            <td className="px-4 py-3 text-gray-400 text-xs text-indigo-200">
                                                {c.contactEmail && <div>{c.contactEmail}</div>}
                                                {c.contactPhone && <div>{c.contactPhone}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => openView(c)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-400" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCompanies.map((c: any) => (
                                <div key={c.id} className="p-4 bg-black/20 border border-white/5 rounded-lg flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{c.name}</p>
                                                    <p className="text-xs text-indigo-400">{c.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {(c.contactEmail || c.contactPhone) && (
                                            <div className="mt-3 bg-black/40 p-2 rounded border border-white/5 text-xs text-gray-400 space-y-1">
                                                {c.contactEmail && <p>{c.contactEmail}</p>}
                                                {c.contactPhone && <p>{c.contactPhone}</p>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center flex-row-reverse gap-1 mt-4 pt-4 border-t border-white/5">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400 bg-black/20" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-400 bg-black/20" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white bg-black/20" onClick={() => openView(c)}><Eye className="h-3.5 w-3.5" /></Button>
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
