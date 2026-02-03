'use client';

import { useState, use, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SCRAP_ITEMS, formatCurrency, calculateDynamicPrice } from '@/lib/pricing';
import { MapPin, Phone, ArrowLeft, Navigation, Scale, CheckCircle2, IndianRupee, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getBookingByIdAction, updateBookingStatusAction, getScrapItemsAction } from '@/app/actions';
import { payCustomerFromAgentWalletAction } from '@/app/wallet-actions';
import QRScannerDialog from '@/components/qr-scanner-dialog';
import { downloadInvoice } from '@/lib/invoice-utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';

const MapPicker = dynamic(() => import('@/components/map-picker-leaflet'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-lg" />
});

export default function PickupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<string>('ASSIGNED');

    // Replace simple weights map with full item details to support edits and additions
    type CartItem = {
        id: string;
        name: string;
        unit: string;
        price: number;
        weight: number;
        isCustom?: boolean;
    };
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [scannedCustomerId, setScannedCustomerId] = useState<string | null>(null);

    const [allScrapItems, setAllScrapItems] = useState<any[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    useEffect(() => {
        loadBooking();
        loadScrapItems();
    }, [id]);

    const loadScrapItems = async () => {
        try {
            const items = await getScrapItemsAction();
            setAllScrapItems(items);
        } catch (e) {
            console.error("Failed to load scrap items", e);
        }
    };

    const loadBooking = async () => {
        setIsLoading(true);
        try {
            const data = await getBookingByIdAction(id);
            if (data) {
                setBooking(data);
                setStatus(data.status);

                // If already weighed (reloading page), load items? 
                // For now, simpler to re-initialize if in WEIGHING state but empty cart
                // Ideally backend would persist the actual 'weighed' items if we had a partial save
                // For this demo, we assume we restart weighing flow or it's fresh
            } else {
                toast.error('Booking not found');
            }
        } catch (error) {
            toast.error('Failed to load booking');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.weight * item.price), 0);
    };

    const handleNavigateToMaps = () => {
        if (booking?.address?.lat && booking?.address?.lng) {
            const lat = booking.address.lat;
            const lng = booking.address.lng;
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(url, '_blank');
        } else {
            toast.error('Location not available');
        }
    };

    const handleAction = async () => {
        let nextStatus = status;

        if (status === 'ASSIGNED') {
            nextStatus = 'ARRIVED';
            try {
                console.log(`[Agent] Updating booking ${id} status to ARRIVED`);
                const result = await updateBookingStatusAction(id, 'ARRIVED');
                if (result.success) {
                    setStatus(nextStatus);
                    await loadBooking(); // Reload to ensure fresh data
                    toast.success('Status updated to Arrived - Customer notified!');
                } else {
                    toast.error('Failed to update status');
                }
            } catch (e) {
                console.error('[Agent] Status update error:', e);
                toast.error('Failed to update status');
            }
            return;
        }

        if (status === 'ARRIVED') {
            // Initialize Cart Items from Booking Info
            const newCartItems: CartItem[] = booking?.items?.map((bi: any) => ({
                id: bi.item.id,
                name: bi.item.name,
                unit: bi.item.unit,
                price: bi.item.currentPrice,
                weight: bi.quantity, // Default to estimated, or 0? User asked for manual type. Maybe keep estimated as start?
                isCustom: false
            })) || [];

            setCartItems(newCartItems);
            setStatus('WEIGHING');
            return; // Client side state switch for UI
        }

        if (status === 'WEIGHING') {
            // Open QR Scanner instead of direct payment
            const totalAmount = calculateTotal();
            if (totalAmount <= 0) {
                toast.error("Total amount cannot be zero");
                return;
            }
            setShowQRScanner(true);
        }
    };

    const handleQRScan = (userId: string) => {
        console.log(`[Agent] Scanned user ID: ${userId}`);

        // Verify scanned ID matches booking customer
        if (userId !== booking.userId) {
            toast.error('QR code does not match the customer for this booking!');
            setScannedCustomerId(null);
            return;
        }

        setScannedCustomerId(userId);
        setShowPaymentConfirm(true);
    };

    const handleConfirmPayment = async () => {
        if (!scannedCustomerId) return;

        const totalAmount = calculateTotal();
        const agentId = booking.agentId;

        try {
            console.log(`[Agent] Processing payment: ₹${totalAmount} to customer ${scannedCustomerId}`);
            const result = await payCustomerFromAgentWalletAction(agentId, scannedCustomerId, id, totalAmount);

            if (result.success) {
                setStatus('COMPLETED');
                setShowPaymentConfirm(false);
                toast.success('Payment Successful! Pickup Completed.');
            } else {
                toast.error(result.error || 'Payment Failed');
            }
        } catch (error) {
            console.error('[Agent] Payment error:', error);
            toast.error('Transaction Error');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center space-y-4">
                <p>Booking not found.</p>
                <Link href="/agent/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/agent/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        Pickup Detail
                        <span className="text-xs font-normal px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {status.replace('_', ' ')}
                        </span>
                    </h1>
                </div>
            </div>

            <div className="space-y-6">
                {/* Customer Info */}
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg text-white">{booking.user?.name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm">{booking.address?.street}, {booking.address?.city}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 mt-1">
                                    <Phone className="h-4 w-4" />
                                    <span className="text-sm">{booking.user?.phone}</span>
                                </div>
                            </div>
                            <Button size="icon" className="rounded-full bg-green-600 hover:bg-green-700">
                                <Phone className="h-4 w-4" />
                            </Button>
                        </div>

                        {(status === 'ASSIGNED' || status === 'ARRIVED') && (
                            <div className="h-[200px] w-full rounded-xl overflow-hidden border border-white/10 shadow-lg mb-4">
                                <MapPicker
                                    initialLat={booking.address?.lat || 20.5937}
                                    initialLng={booking.address?.lng || 78.9629}
                                    onLocationSelect={() => { }}
                                />
                            </div>
                        )}

                        {(status === 'ASSIGNED' || status === 'ARRIVED') && (
                            <Button
                                onClick={handleNavigateToMaps}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/20 rounded-xl font-bold gap-2 h-12"
                            >
                                <Navigation className="h-4 w-4" /> Navigate with Maps
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Weighing Section */}
                {(status === 'WEIGHING' || status === 'COMPLETED') && (
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-yellow-400" />
                                    {status === 'COMPLETED' ? 'Final Bill' : 'Weigh Items'}
                                </div>
                                {status === 'WEIGHING' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setCartItems([...cartItems, { id: `custom-${Date.now()}`, name: '', unit: 'kg', price: 0, weight: 0, isCustom: true }])}
                                        className="text-xs h-7 bg-green-600 border-none hover:bg-green-700 text-white"
                                    >
                                        + Add Item
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cartItems.map((item, index) => {
                                const itemTotal = item.weight * item.price;

                                return (
                                    <div key={item.id} className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="grid grid-cols-12 gap-2 items-center">
                                            {/* Name (Col 5) */}
                                            <div className="col-span-5 relative">
                                                <label className="text-[10px] text-gray-500 uppercase">Item</label>
                                                {status === 'COMPLETED' ? (
                                                    <p className="font-medium text-white text-sm">{item.name}</p>
                                                ) : (
                                                    <>
                                                        <Input
                                                            value={item.name}
                                                            onChange={(e) => {
                                                                const newItems = [...cartItems];
                                                                newItems[index].name = e.target.value;
                                                                setCartItems(newItems);
                                                                setFocusedIndex(index);
                                                            }}
                                                            onFocus={() => setFocusedIndex(index)}
                                                            onBlur={() => setTimeout(() => setFocusedIndex(null), 200)}
                                                            placeholder="Item Name"
                                                            className="bg-black/40 border-white/20 text-white h-8 text-sm"
                                                        />
                                                        {focusedIndex === index && item.name.length >= 1 && (
                                                            <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/20 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                                                {allScrapItems
                                                                    .filter(si => si.name.toLowerCase().includes(item.name.toLowerCase()))
                                                                    .slice(0, 5)
                                                                    .map(si => (
                                                                        <div
                                                                            key={si.id}
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault(); // Prevent onBlur from firing before selection
                                                                                const newItems = [...cartItems];
                                                                                newItems[index].name = si.name;
                                                                                newItems[index].price = si.currentPrice;
                                                                                // If unit is available in si, update it
                                                                                if (si.unit) newItems[index].unit = si.unit;
                                                                                setCartItems(newItems);
                                                                                setFocusedIndex(null);
                                                                            }}
                                                                            className="p-3 hover:bg-green-600/20 hover:text-green-400 cursor-pointer text-xs border-b border-white/5 last:border-0 transition-colors flex justify-between items-center text-white"
                                                                        >
                                                                            <span>{si.name}</span>
                                                                            <span className="text-[10px] text-gray-400">₹{si.currentPrice}/{si.unit}</span>
                                                                        </div>
                                                                    ))
                                                                }
                                                                {allScrapItems.filter(si => si.name.toLowerCase().includes(item.name.toLowerCase())).length === 0 && (
                                                                    <div className="p-3 text-xs text-gray-400 italic">No matches found</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Price (Col 3) */}
                                            <div className="col-span-3">
                                                <label className="text-[10px] text-gray-500 uppercase">Price/Unit</label>
                                                {status === 'COMPLETED' ? (
                                                    <p className="text-gray-400 text-sm">₹{item.price}</p>
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        value={item.price || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...cartItems];
                                                            newItems[index].price = parseFloat(e.target.value) || 0;
                                                            setCartItems(newItems);
                                                        }}
                                                        className="bg-black/40 border-white/20 text-white h-8 text-sm px-1 text-center"
                                                        placeholder="Rate"
                                                    />
                                                )}
                                            </div>

                                            {/* Weight (Col 4) */}
                                            <div className="col-span-4">
                                                <label className="text-[10px] text-gray-500 uppercase">Qty ({item.unit})</label>
                                                {status === 'COMPLETED' ? (
                                                    <p className="text-white text-sm text-right">{item.weight} {item.unit}</p>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            value={item.weight || ''}
                                                            onChange={(e) => {
                                                                const newItems = [...cartItems];
                                                                newItems[index].weight = parseFloat(e.target.value) || 0;
                                                                setCartItems(newItems);
                                                            }}
                                                            className="bg-black/40 border-white/20 text-white h-8 text-sm text-right"
                                                            placeholder="Qty"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Total Row */}
                                        <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                            {status === 'WEIGHING' && (
                                                <button
                                                    onClick={() => {
                                                        const newItems = cartItems.filter((_, i) => i !== index);
                                                        setCartItems(newItems);
                                                    }}
                                                    className="text-xs text-red-400 hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                            <div className="ml-auto text-sm text-green-400 font-mono">
                                                ₹{itemTotal.toFixed(0)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {cartItems.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-4">No items added. Add items manually.</p>
                            )}

                            <div className="border-t border-white/10 pt-4 flex justify-between items-center mt-4 bg-white/5 p-3 rounded-lg">
                                <div>
                                    <p className="text-gray-400 text-sm">Grand Total</p>
                                    <p className="text-[10px] text-gray-600">{cartItems.length} Items</p>
                                </div>
                                <span className="text-3xl font-bold text-green-400">{formatCurrency(calculateTotal())}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="sticky bottom-4">
                    {status === 'COMPLETED' ? (
                        <Card className="bg-green-900/20 border-green-500/30 backdrop-blur-md">
                            <CardContent className="p-4 flex items-center gap-4 text-green-400">
                                <CheckCircle2 className="h-8 w-8" />
                                <div className="flex-1">
                                    <p className="font-bold">Pickup Completed</p>
                                    <p className="text-xs text-green-400/70">Payment recorded successfully.</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadInvoice(booking)}
                                    className="border-green-500/50 text-green-400 hover:bg-green-500/10 gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Invoice
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Button
                            onClick={handleAction}
                            className="w-full h-14 text-lg font-bold shadow-xl shadow-green-900/20 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl transition-all"
                        >
                            {status === 'ASSIGNED' && 'Arrived at Location'}
                            {status === 'ARRIVED' && 'Start Weighing'}
                            {status === 'WEIGHING' && (
                                <span className="flex items-center gap-2">
                                    <IndianRupee className="h-5 w-5" /> Pay & Complete
                                </span>
                            )}
                        </Button>
                    )}

                    {status === 'COMPLETED' && (
                        <Link href="/agent/dashboard" className="block mt-4">
                            <Button className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-gray-100 shadow-xl rounded-xl">
                                Done
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* QR Scanner Dialog */}
            <QRScannerDialog
                open={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
            />

            {/* Payment Confirmation Dialog */}
            <Dialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Customer verified! Ready to process payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-sm font-medium text-gray-700">Payment Amount:</span>
                            <span className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotal())}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            The amount will be transferred from your wallet to the customer's wallet.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmPayment}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
