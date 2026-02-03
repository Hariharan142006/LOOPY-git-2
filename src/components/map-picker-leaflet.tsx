'use client';

import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Fix for default marker icon in Leaflet + Next.js
if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    initialLat?: number;
    initialLng?: number;
    controlRef?: any;
}

export interface MapPickerHandle {
    panToCurrentLocation: () => void;
}

// Component to handle map clicks
function LocationMarker({
    position,
    setPosition,
    fetchAddress
}: {
    position: [number, number] | null,
    setPosition: (pos: [number, number]) => void,
    fetchAddress: (lat: number, lng: number) => void
}) {
    const map = useMap();

    // Pan to position when it updates externally
    useEffect(() => {
        if (position && map) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            fetchAddress(lat, lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

// Component to expose map controls via ref
function MapController({
    exposedRef,
    setPosition,
    fetchAddress
}: {
    exposedRef: any,
    setPosition: (pos: [number, number]) => void,
    fetchAddress: (lat: number, lng: number) => void
}) {
    const map = useMap();

    useImperativeHandle(exposedRef, () => ({
        panToCurrentLocation: () => {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude: lat, longitude: lng } = position.coords;
                    setPosition([lat, lng]);
                    if (map) {
                        map.flyTo([lat, lng], 18); // Zoom in closer (18) for better precision
                    }
                    fetchAddress(lat, lng);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    let updateMessage = "Could not get your location.";
                    if (error.code === 1) updateMessage = "Location permission denied.";
                    else if (error.code === 2) updateMessage = "Location unavailable.";
                    else if (error.code === 3) updateMessage = "Location request timed out.";
                    toast.error(updateMessage);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    }));

    return null;
}

const MapPickerLeaflet = ({ onLocationSelect, initialLat, initialLng, controlRef }: MapPickerProps) => {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [isMounted, setIsMounted] = useState(false);

    // Initial position effect
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchAddress = useCallback(async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: {
                    'User-Agent': 'LoopyScrapApp/1.0'
                }
            });
            const data = await response.json();
            if (data && data.display_name) {
                onLocationSelect(lat, lng, data.display_name);
            } else {
                onLocationSelect(lat, lng);
            }
        } catch (error) {
            console.error("Nominatim Geocoding failed:", error);
            onLocationSelect(lat, lng);
        }
    }, [onLocationSelect]);

    if (!isMounted) {
        return (
            <div className="h-[400px] w-full bg-gray-900 animate-pulse rounded-lg flex items-center justify-center text-gray-500 border border-white/10">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading Maps...
            </div>
        );
    }

    const center: [number, number] = position || [20.5937, 78.9629]; // Default to India or selected pos

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-white/20 relative z-0">
            <MapContainer
                center={center}
                zoom={position ? 15 : 5}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', background: '#111' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} fetchAddress={fetchAddress} />
                <MapController exposedRef={controlRef} setPosition={setPosition} fetchAddress={fetchAddress} />
            </MapContainer>
        </div>
    );
};

MapPickerLeaflet.displayName = "MapPickerLeaflet";

export default MapPickerLeaflet;
