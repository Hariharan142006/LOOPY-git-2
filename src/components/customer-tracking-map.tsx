'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Helper: Calculate bearing between two points
const calculateBearing = (start: [number, number], end: [number, number]) => {
    const lat1 = (start[0] * Math.PI) / 180;
    const lat2 = (end[0] * Math.PI) / 180;
    const lon1 = (start[1] * Math.PI) / 180;
    const lon2 = (end[1] * Math.PI) / 180;

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360; // range [0, 360]
};

// 2D Top-Down Truck Icon (Orange Cab + Blue Body)
const getAgentTruckIcon = (rotation: number = 0) => {
    return new L.DivIcon({
        className: 'agent-truck-marker',
        html: `
            <div style="transform: rotate(${rotation}deg); transition: transform 0.8s ease-out;" class="relative">
                <svg width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Body (Blue) -->
                    <rect x="15" y="5" width="40" height="20" rx="2" fill="#2563EB" stroke="#1E40AF" stroke-width="1.5"/>
                    <rect x="20" y="8" width="30" height="2" rx="1" fill="white" fill-opacity="0.3"/>
                    <rect x="20" y="20" width="30" height="2" rx="1" fill="white" fill-opacity="0.3"/>
                    
                    <!-- Cab (Orange) -->
                    <rect x="0" y="6" width="18" height="18" rx="3" fill="#F97316" stroke="#C2410C" stroke-width="1.5"/>
                    <rect x="4" y="9" width="6" height="12" rx="1" fill="#FFEDD5"/>
                    
                    <!-- Details -->
                    <rect x="15" y="6" width="3" height="18" fill="#1E3A8A"/>
                </svg>
            </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
    });
};

// Orange Pulsing Destination Point
const customerIcon = typeof window !== 'undefined' ? new L.DivIcon({
    className: 'customer-marker',
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-orange-500/20 rounded-full animate-ping"></div>
            <div class="absolute w-6 h-6 bg-orange-500/40 rounded-full animate-pulse"></div>
            <div class="relative w-4 h-4 bg-orange-600 rounded-full border-2 border-white shadow-xl"></div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
}) : null;

function MapUpdater({ agentLoc, customerLoc, hasPath }: { agentLoc: [number, number], customerLoc: [number, number], hasPath: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (agentLoc && customerLoc) {
            const bounds = L.latLngBounds([agentLoc, customerLoc]);
            map.fitBounds(bounds, { padding: [100, 100], animate: true });
        }
    }, [agentLoc, customerLoc, map, hasPath]);
    return null;
}

interface CustomerTrackingMapProps {
    agentLocation: { lat: number, lng: number } | null;
    pickupLocation: { lat: number, lng: number };
    agentName?: string;
    bookingStatus: string;
}

export default function CustomerTrackingMap({ agentLocation, pickupLocation, agentName, bookingStatus }: CustomerTrackingMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [roadPath, setRoadPath] = useState<[number, number][]>([]);
    const [traveledPath, setTraveledPath] = useState<[number, number][]>([]);
    const [rotation, setRotation] = useState(0);
    const initialLocationRef = useRef<{ lat: number, lng: number } | null>(null);
    const lastFetchedLocationRef = useRef<{ lat: number, lng: number } | null>(null);
    const prevAgentLocationRef = useRef<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Effect to set initial location and fetch road path
    useEffect(() => {
        if (agentLocation && !initialLocationRef.current) {
            initialLocationRef.current = agentLocation;
            setTraveledPath([[agentLocation.lat, agentLocation.lng]]);
        }

        const fetchRoadPath = async () => {
            if (!agentLocation || !pickupLocation) return;

            // Avoid frequent OSRM calls if movement is minimal
            if (lastFetchedLocationRef.current) {
                const dist = L.latLng(agentLocation.lat, agentLocation.lng).distanceTo(
                    L.latLng(lastFetchedLocationRef.current.lat, lastFetchedLocationRef.current.lng)
                );
                if (dist < 50) return;
            }

            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${agentLocation.lng},${agentLocation.lat};${pickupLocation.lng},${pickupLocation.lat}?overview=full&geometries=geojson`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.routes && data.routes[0]) {
                    const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                    setRoadPath(coords);
                    lastFetchedLocationRef.current = agentLocation;
                }
            } catch (err) {
                console.error("OSRM Fetch Error:", err);
            }
        };

        fetchRoadPath();
    }, [agentLocation, pickupLocation]);

    // Track movement history and calculate rotation
    useEffect(() => {
        if (agentLocation) {
            if (prevAgentLocationRef.current) {
                const start: [number, number] = [prevAgentLocationRef.current.lat, prevAgentLocationRef.current.lng];
                const end: [number, number] = [agentLocation.lat, agentLocation.lng];

                // Only update rotation if moved significantly (to avoid flickering)
                if (L.latLng(start).distanceTo(L.latLng(end)) > 5) {
                    const newBearing = calculateBearing(start, end);
                    // SVG cab is on the left, so we adjust by adding 180 degrees often or just matching SVG orientation
                    // In our SVG, car is horizontal, cab on left.
                    setRotation(newBearing - 180);
                }
            }

            setTraveledPath(prev => {
                const last = prev[prev.length - 1];
                if (last && last[0] === agentLocation.lat && last[1] === agentLocation.lng) return prev;
                return [...prev, [agentLocation.lat, agentLocation.lng]];
            });

            prevAgentLocationRef.current = agentLocation;
        }
    }, [agentLocation]);

    if (!isMounted) {
        return (
            <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-gray-500 border border-gray-200">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Initializing Tracking Map...
            </div>
        );
    }

    const agentPos: [number, number] | null = agentLocation ? [agentLocation.lat, agentLocation.lng] : null;
    const customerPos: [number, number] = [pickupLocation.lat, pickupLocation.lng];

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={customerPos}
                zoom={16}
                scrollWheelZoom={true}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Traveled Path (FAINT DASHED) */}
                {traveledPath.length > 1 && (
                    <Polyline
                        positions={traveledPath}
                        color="#94a3b8"
                        weight={3}
                        opacity={0.4}
                        dashArray="5, 12"
                    />
                )}

                {/* Remaining Road Path (THICK SOLID BLUE) */}
                {roadPath.length > 1 && (
                    <Polyline
                        positions={roadPath}
                        color="#1d4ed8"
                        weight={8}
                        opacity={0.9}
                    />
                )}

                {/* Destination Point (Orange Pulsing) */}
                <Marker position={customerPos} icon={customerIcon as L.DivIcon} />

                {/* Agent Live Location (Rotating 2D Truck) */}
                {agentPos && (
                    <Marker position={agentPos} icon={getAgentTruckIcon(rotation)}>
                        <Popup>{agentName || 'Agent'} is on the way!</Popup>
                    </Marker>
                )}

                {agentPos && (
                    <MapUpdater
                        agentLoc={agentPos}
                        customerLoc={customerPos}
                        hasPath={roadPath.length > 0}
                    />
                )}
            </MapContainer>
        </div>
    );
}
