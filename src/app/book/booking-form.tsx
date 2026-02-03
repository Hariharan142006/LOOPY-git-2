'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, MapPin, Package, CheckCircle2, Scale, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ScrapItemWithCategory } from '@/lib/types';
import Image from 'next/image';
import { BookOpen, Tv, Smartphone, Trash2, Newspaper, Shirt, Component, Zap, Monitor, Loader2, Car, Battery, Wine, Refrigerator } from 'lucide-react';
import { createBookingAction } from '@/app/actions';
import { getUserAddressesAction } from '@/app/address-actions';
import { useAuthStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icon Map with Custom Images
const ICON_MAP: Record<string, any> = {
    'Newspaper': '/icons/newspaper.png',
    'Paper': '/icons/newspaper.png',
    'Books': '/icons/newspaper.png', // Fallback or specific
    'Cardboard': '/icons/cardboard.png',
    'Plastic': '/icons/plastic.png',
    'Iron': '/icons/metal.png',
    'Metal': '/icons/metal.png',
    'E-waste': '/icons/e-waste.png',
    'Others': Trash2
};

// Simplified Categories mapping removed in favor of dynamic lookup

const CATEGORIES = [
    { name: 'Paper', icon: '/icons/newspaper.png', color: 'bg-yellow-500' },
    { name: 'Plastics', icon: '/icons/plastic.png', color: 'bg-blue-500' },
    { name: 'Metals', icon: '/icons/metal.png', color: 'bg-gray-500' },
    { name: 'E-waste / Electronics', icon: '/icons/e-waste.png', color: 'bg-purple-500' },
    { name: 'Appliances', icon: Refrigerator, color: 'bg-orange-500' },
    { name: 'Glass', icon: Wine, color: 'bg-teal-500' },
    { name: 'Automotive', icon: Car, color: 'bg-red-500' },
    { name: 'Textiles', icon: Shirt, color: 'bg-pink-500' },
    { name: 'Batteries', icon: Battery, color: 'bg-green-500' },
];

const WEIGHT_RANGES = [
    { label: '0-5 Kgs', min: 0, max: 5, avg: 2.5 },
    { label: '5-10 Kgs', min: 5, max: 10, avg: 7.5 },
    { label: '10-15 Kgs', min: 10, max: 15, avg: 12.5 },
    { label: 'More than 15 Kgs', min: 15, max: 100, avg: 20 }
];

// Time Slots configuration
const TIME_SLOTS = [
    { label: '9:30 AM - 11:30 AM', value: '09:30' },
    { label: '11:30 AM - 1:30 PM', value: '11:30' },
    { label: '2:30 PM - 4:30 PM', value: '14:30' },
    { label: '4:30 PM - 7:00 PM', value: '16:30' }
];

// Dynamically import MapPicker
const MapPicker = dynamic(() => import('@/components/map-picker-leaflet'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

const STEPS = [
    { id: 1, name: 'Materials', icon: Package },
    { id: 2, name: 'Schedule', icon: CalendarIcon },
    { id: 3, name: 'Weight', icon: Scale },
    { id: 4, name: 'Location', icon: MapPin },
    { id: 5, name: 'Review', icon: CheckCircle2 },
];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount);
}

interface BookingFormProps {
    items: ScrapItemWithCategory[];
}

export default function BookingForm({ items }: BookingFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const { user } = useAuthStore();

    // State
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [schedule, setSchedule] = useState({ date: '', time: '' });
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string; isManual?: boolean } | null>(null);
    const [selectedWeightRange, setSelectedWeightRange] = useState<typeof WEIGHT_RANGES[0] | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

    // Address handling
    const [showMapPicker, setShowMapPicker] = useState(false);
    const mapPickerRef = useRef<any>(null);

    // Fetch addresses on mount
    useEffect(() => {
        if (user?.id) {
            getUserAddressesAction(user.id).then(setSavedAddresses);
        }
    }, [user?.id]);

    const handleCategoryToggle = (categoryName: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryName)) {
                return prev.filter(c => c !== categoryName);
            } else {
                return [...prev, categoryName];
            }
        });
    };

    const calculateItemsForBackend = () => {
        if (!selectedWeightRange || selectedCategories.length === 0) return [];
        const weightPerCategory = selectedWeightRange.avg / selectedCategories.length;

        return selectedCategories.map(cat => {
            const dbItem = items.find(i => {
                const catName = i.category?.name?.toLowerCase() || '';
                const search = cat.toLowerCase();
                if (search === 'e-waste' && (catName.includes('electronic') || catName.includes('e-waste'))) return true;
                return catName.includes(search) || (search.endsWith('s') ? catName.includes(search.slice(0, -1)) : catName.includes(search));
            });

            if (!dbItem) return null;

            return {
                id: dbItem.id,
                qty: Math.round(weightPerCategory)
            };
        }).filter(Boolean) as { id: string, qty: number }[];
    };

    const calculateTotalEstimatedValue = () => {
        const backendItems = calculateItemsForBackend();
        let total = 0;
        backendItems.forEach(item => {
            const dbItem = items.find(i => i.id === item.id);
            if (dbItem) total += dbItem.currentPrice * item.qty;
        });
        return total;
    };

    const getMinDateString = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleUseCurrentLocation = () => {
        setIsLocating(true); // Re-using loading state or create a new one
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude, address: "Fetching address...", isManual: false });

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                            headers: {
                                'User-Agent': 'ScrapFlow-Web/1.0',
                                'Accept-Language': 'en-US,en;q=0.9'
                            }
                        });

                        if (!response.ok) throw new Error('Geocoding service unavailable');

                        const data = await response.json();
                        if (data && data.display_name) {
                            setLocation({
                                lat: latitude,
                                lng: longitude,
                                address: data.display_name,
                                isManual: false
                            });
                        } else {
                            setLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, isManual: false });
                        }
                    } catch (error) {
                        console.warn("Reverse geocoding failed (using coords):", error);
                        setLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, isManual: false });
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("Location access denied or unavailable.");
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            toast.error("Geolocation is not supported by your browser.");
            setIsLocating(false);
        }
    };

    const handleSubmit = async () => {
        if (!schedule.date || !schedule.time || !location || !selectedWeightRange) {
            toast.error("Please fill in all details.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (!user?.id) {
                toast.error('You must be logged in to book.');
                return;
            }

            const bookingItems = calculateItemsForBackend();

            const result = await createBookingAction(user.id, {
                items: bookingItems,
                schedule,
                location: location!,
                totalAmount: calculateTotalEstimatedValue(),
                remarks
            });

            if (result.success) {
                toast.success('Pickup scheduled successfully!');
                router.push('/dashboard');
            } else {
                toast.error('Failed to schedule pickup');
            }
        } catch (e) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Simplified Steps
    const NEW_STEPS = [
        { id: 1, name: 'Materials', icon: Package },
        { id: 2, name: 'Pickup Details', icon: CalendarIcon },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book a Pickup</h1>
                <p className="text-gray-600">Schedule a scrap collection from your doorstep.</p>
            </div>

            {/* Stepper */}
            <div className="relative flex items-center justify-between w-full max-w-sm mx-auto mb-8">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10" />
                <div
                    className="absolute left-0 top-1/2 h-1 bg-green-500 transition-all duration-300 -z-10"
                    style={{ width: `${((currentStep - 1) / (NEW_STEPS.length - 1)) * 100}%` }}
                />
                {NEW_STEPS.map((step) => {
                    const isActive = step.id <= currentStep;
                    const isCurrent = step.id === currentStep;
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                            <div
                                className={cn(
                                    "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 transition-all",
                                    isActive ? "border-green-500 bg-green-500 text-white" : "border-gray-300 bg-white text-gray-400",
                                    isCurrent && "ring-4 ring-green-500/20"
                                )}
                            >
                                <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <span className={cn("text-xs font-medium", isActive ? "text-green-600" : "text-gray-500")}>
                                {step.name}
                            </span>
                        </div>
                    )
                })}
            </div>

            <Card className="border-gray-200 bg-white shadow-sm min-h-[400px]">
                <CardContent className="pt-6">
                    {/* Step 1: Materials */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-center mb-6">Select Materials</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {CATEGORIES.map((cat) => {
                                    const isSelected = selectedCategories.includes(cat.name);
                                    const IconComponent = cat.icon;
                                    const isImage = typeof IconComponent === 'string';

                                    return (
                                        <div
                                            key={cat.name}
                                            onClick={() => handleCategoryToggle(cat.name)}
                                            className={cn(
                                                "cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center text-center gap-3 relative overflow-hidden group hover:shadow-md",
                                                isSelected ? "border-green-500 bg-green-50" : "border-gray-100 bg-white hover:border-green-200"
                                            )}
                                        >
                                            <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                                                {isImage ? (
                                                    <Image src={IconComponent} alt={cat.name} fill className="object-contain" />
                                                ) : (
                                                    <IconComponent className={cn("w-10 h-10 md:w-12 md:h-12", isSelected ? "text-green-600" : "text-gray-500")} />
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-800">{cat.name}</span>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pickup Details (Consolidated) */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date & Time */}
                                <div className="space-y-2">
                                    <Label className="font-semibold text-gray-700">Enter Date</Label>
                                    <Input
                                        type="date"
                                        min={getMinDateString()}
                                        className="h-12 border-gray-300 bg-white"
                                        value={schedule.date}
                                        onChange={(e) => setSchedule(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-gray-700">Enter Time</Label>
                                    <select
                                        className="w-full h-12 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={schedule.time}
                                        onChange={(e) => setSchedule(prev => ({ ...prev, time: e.target.value }))}
                                    >
                                        <option value="" disabled>Select Time</option>
                                        {TIME_SLOTS.map(slot => (
                                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Address Selection Tabs */}
                            <div className="space-y-4">
                                <Label className="font-semibold text-gray-700">Select Pickup Location</Label>
                                <Tabs defaultValue="saved" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="saved">Saved API</TabsTrigger>
                                        <TabsTrigger value="current">Current Loc</TabsTrigger>
                                        <TabsTrigger value="map">Map</TabsTrigger>
                                    </TabsList>

                                    {/* Tab 1: Saved Addresses */}
                                    <TabsContent value="saved" className="space-y-4">
                                        {savedAddresses.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {savedAddresses.map((addr: any) => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => setLocation({
                                                            lat: addr.lat,
                                                            lng: addr.lng,
                                                            address: `${addr.street}, ${addr.city}, ${addr.zip}`,
                                                            isManual: false
                                                        })}
                                                        className={cn(
                                                            "p-3 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center group",
                                                            location?.lat === addr.lat && location?.lng === addr.lng
                                                                ? "border-green-500 bg-green-50"
                                                                : "border-gray-100 bg-white hover:border-green-200"
                                                        )}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                                                                <Home className="h-4 w-4 text-green-600" />
                                                                {addr.label}
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">{addr.street}, {addr.city}</p>
                                                        </div>
                                                        {location?.lat === addr.lat && location?.lng === addr.lng && (
                                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                                <p className="text-sm text-gray-500 mb-2">No saved addresses found.</p>
                                                <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                                                    Manage Addresses in Profile
                                                </Button>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Tab 2: Current Location */}
                                    <TabsContent value="current" className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center space-y-4">
                                            <div className="flex justify-center">
                                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <MapPin className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-blue-900">Use Current Location</h3>
                                                <p className="text-sm text-blue-600 mt-1">We'll fetch your precise GPS coordinates</p>
                                            </div>
                                            <Button
                                                onClick={handleUseCurrentLocation}
                                                disabled={isLocating}
                                                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                            >
                                                {isLocating ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting...</>
                                                ) : (
                                                    "Detect My Location"
                                                )}
                                            </Button>
                                            {location && location.isManual === false && !savedAddresses.some(a => a.lat === location.lat) && (
                                                <div className="mt-4 p-3 bg-white rounded border border-blue-100 text-left">
                                                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Selected Location</p>
                                                    <p className="text-sm text-gray-900">{location.address}</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Tab 3: Map Picker */}
                                    <TabsContent value="map" className="space-y-4">
                                        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 relative">
                                            <MapPicker
                                                controlRef={mapPickerRef}
                                                onLocationSelect={(lat, lng, addr) => {
                                                    setLocation({ lat, lng, address: addr || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, isManual: true });
                                                }}
                                            />
                                            {/* Helper text overlay */}
                                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg text-xs text-center border shadow-sm">
                                                Drag map to pin your exact location
                                            </div>
                                        </div>
                                        {location && location.isManual === true && (
                                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Pinned Address</p>
                                                <p className="text-sm text-gray-900">{location.address}</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>

                                {/* Common Address Confirmation Display (if selected from any tab) */}
                                {location && (
                                    <div className="mt-4 flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                        <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-green-700 uppercase mb-0.5">Pickup Location</p>
                                            <p className="text-sm text-gray-800 leading-tight">{location.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Estimated Weight</Label>
                                <select
                                    className="w-full h-12 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={selectedWeightRange?.label || ''}
                                    onChange={(e) => {
                                        const range = WEIGHT_RANGES.find(r => r.label === e.target.value);
                                        setSelectedWeightRange(range || null);
                                    }}
                                >
                                    <option value="" disabled>Select Weight</option>
                                    {WEIGHT_RANGES.map(range => (
                                        <option key={range.label} value={range.label}>{range.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Remarks */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Remarks <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                <Input
                                    placeholder="Any instructions for the pickup agent..."
                                    className="h-12 border-gray-300 bg-white"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t border-gray-200 pt-6 px-6 pb-6">
                    {currentStep === 1 ? (
                        <div className="w-full flex justify-end">
                            <Button
                                onClick={() => setCurrentStep(2)}
                                disabled={selectedCategories.length === 0}
                                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                            >
                                Next Step
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                                className="border-gray-300 text-gray-700"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white flex-1 font-bold tracking-wide shadow-md shadow-green-200"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : 'SCHEDULE A PICKUP'}
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
