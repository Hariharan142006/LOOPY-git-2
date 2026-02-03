'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { MapPin, User, Phone, Calendar, Package, AlertTriangle, Save } from "lucide-react";
import { format } from "date-fns";

interface PickupDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any; // Using any for now to match page.tsx loose typing
    onUpdate: (bookingId: string, updates: any) => Promise<void>;
}

export function PickupDetailSheet({ isOpen, onClose, booking, onUpdate }: PickupDetailSheetProps) {
    const [status, setStatus] = useState(booking?.status || 'PENDING');
    const [remarks, setRemarks] = useState(booking?.remarks || '');
    const [items, setItems] = useState<any[]>(booking?.items || []);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (booking) {
            setStatus(booking.status);
            setRemarks(booking.remarks || '');
            setItems(booking.items || []);
        }
    }, [booking]);

    if (!booking) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(booking.id, {
                status,
                remarks,
                // In a real app, we'd send the updated items logic here too
            });
            toast.success("Pickup updated successfully");
            onClose();
        } catch (error) {
            toast.error("Failed to update pickup");
        } finally {
            setIsSaving(false);
        }
    };

    const handleItemQtyChange = (itemId: string, newQty: string) => {
        // Logic to update local draft of items
        setItems(items.map(i => i.id === itemId ? { ...i, quantity: parseFloat(newQty) } : i));
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900 border-l border-white/10 text-white overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white flex items-center justify-between">
                        <span>Pickup #{booking.id.slice(-6)}</span>
                        <Badge variant="outline" className="ml-2">{booking.status}</Badge>
                    </SheetTitle>
                    <SheetDescription>
                        Full details and operational controls.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    {/* Customer Info */}
                    <div className="space-y-4 rounded-lg bg-white/5 p-4 border border-white/10">
                        <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                            <User className="h-4 w-4" /> Customer Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-xs text-gray-500">Name</label>
                                <p>{booking.user?.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Phone</label>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    {booking.user?.phone}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">Address</label>
                                <p className="flex items-start gap-2">
                                    <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                    {booking.address?.label || booking.address?.street || 'No address provided'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Controls */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-300">Operations</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="ASSIGNED">Assigned</SelectItem>
                                        <SelectItem value="ARRIVED">Arrived</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Scheduled Time</Label>
                                <div className="h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm flex items-center gap-2 text-gray-400 cursor-not-allowed">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(booking.scheduledAt), 'MMM d, h:mm a')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Admin Remarks (Internal)</Label>
                            <Textarea
                                placeholder="Add notes for other admins..."
                                className="bg-white/5 border-white/10 text-white min-h-[80px]"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Weight Dispute / Edit */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                                <Package className="h-4 w-4" /> Items & Weights
                            </h3>
                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Editable
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/5">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.item.name}</p>
                                        <p className="text-xs text-gray-500">{item.item.category?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 w-[120px]">
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemQtyChange(item.id, e.target.value)}
                                            className="h-8 bg-black/20 text-right"
                                        />
                                        <span className="text-xs text-gray-500 w-8">{item.item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
                    <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            if (confirm("Are you sure you want to cancel this booking?")) {
                                onUpdate(booking.id, { status: 'CANCELLED' });
                                onClose();
                            }
                        }}
                    >
                        Cancel Pickup
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full sm:w-1/2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
