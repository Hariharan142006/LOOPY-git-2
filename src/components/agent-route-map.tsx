'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Navigation, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

// Custom Icons
const agentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const availableIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const assignedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface AgentRouteMapProps {
    agentLocation: { lat: number, lng: number } | null;
    tasks: any[];
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function AgentRouteMap({ agentLocation, tasks }: AgentRouteMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [roadPoints, setRoadPoints] = useState<[number, number][]>([]);
    const [isRouting, setIsRouting] = useState(false);
    const [routeStats, setRouteStats] = useState<{ distance: number, duration: number } | null>(null);

    const assignedTasks = tasks.filter(t => t.status !== 'PENDING' && t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Road Routing Logic with OSRM
    useEffect(() => {
        if (!agentLocation || assignedTasks.length === 0) {
            setRoadPoints([]);
            setRouteStats(null);
            return;
        }

        const fetchRoadPoints = async () => {
            setIsRouting(true);
            try {
                // Construct OSRM multi-point coordinates: lng,lat;lng,lat...
                const coords = [
                    `${agentLocation.lng},${agentLocation.lat}`,
                    ...assignedTasks.map(t => `${t.pickupLng},${t.pickupLat}`)
                ].join(';');

                const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
                const data = await response.json();

                if (data.code === 'Ok' && data.routes?.[0]) {
                    const geometry = data.routes[0].geometry.coordinates;
                    // GeoJSON is [lng, lat], Leaflet is [lat, lng]
                    const latLngs: [number, number][] = geometry.map((coord: [number, number]) => [coord[1], coord[0]]);
                    setRoadPoints(latLngs);

                    // Extract stats
                    setRouteStats({
                        distance: data.routes[0].distance / 1000, // meters to km
                        duration: data.routes[0].duration / 60     // seconds to mins
                    });
                } else {
                    // Fallback to straight lines if OSRM fails
                    const straightLines: [number, number][] = [
                        [agentLocation.lat, agentLocation.lng],
                        ...assignedTasks.map(t => [t.pickupLat, t.pickupLng] as [number, number])
                    ];
                    setRoadPoints(straightLines);
                    setRouteStats(null);
                }
            } catch (error) {
                console.error("OSRM Routing failed:", error);
            } finally {
                setIsRouting(false);
            }
        };

        fetchRoadPoints();
    }, [agentLocation, assignedTasks.length]); // Refresh route if location or task count changes

    // Google Maps Navigation URL Logic
    const handleGoogleMapsNavigation = () => {
        if (!agentLocation || assignedTasks.length === 0) {
            toast.error("No active tasks to navigate to");
            return;
        }

        const origin = `${agentLocation.lat},${agentLocation.lng}`;
        const destination = `${assignedTasks[assignedTasks.length - 1].pickupLat},${assignedTasks[assignedTasks.length - 1].pickupLng}`;

        // Waypoints (all stops except the last one)
        const waypoints = assignedTasks.slice(0, -1)
            .map(t => `${t.pickupLat},${t.pickupLng}`)
            .join('|');

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;

        window.open(googleMapsUrl, '_blank');
    };

    if (!isMounted) {
        return (
            <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Initializing Map...
            </div>
        );
    }

    const availableTasks = tasks.filter(t => t.status === 'PENDING');

    const center: [number, number] = agentLocation
        ? [agentLocation.lat, agentLocation.lng]
        : (tasks.length > 0 && tasks[0].pickupLat ? [tasks[0].pickupLat, tasks[0].pickupLng] : [20.5937, 78.9629]);

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group z-0">
            {/* Navigation Button Overlay */}
            <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2">
                {assignedTasks.length > 0 && (
                    <Button
                        size="sm"
                        onClick={handleGoogleMapsNavigation}
                        className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-md font-bold text-xs gap-2 h-9"
                    >
                        <Navigation className="h-4 w-4 text-blue-600" />
                        Google Maps
                    </Button>
                )}
            </div>

            {/* Route Stats Card */}
            {routeStats && assignedTasks.length > 0 && (
                <div className="absolute top-4 left-4 z-[9999]">
                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-xl space-y-2 min-w-[160px]">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Distance</span>
                            <span className="text-sm font-black text-gray-900">{routeStats.distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Est. Duration</span>
                            <span className="text-sm font-black text-green-600">{Math.ceil(routeStats.duration)} mins</span>
                        </div>
                        <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-medium">{assignedTasks.length} Stops Planned</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Indicator for Routing */}
            {isRouting && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[9998] flex items-center justify-center text-center">
                    <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-700">
                        <Loader2 className="h-3 w-3 animate-spin text-green-600" />
                        Calculating Road Path...
                    </div>
                </div>
            )}
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Agent Marker */}
                {agentLocation && (
                    <Marker position={[agentLocation.lat, agentLocation.lng]} icon={agentIcon}>
                        <Popup>
                            <div className="font-bold">Your Location</div>
                        </Popup>
                    </Marker>
                )}

                {/* Available Pickup Markers */}
                {availableTasks.map(task => (
                    <Marker
                        key={task.id}
                        position={[task.pickupLat, task.pickupLng]}
                        icon={availableIcon}
                    >
                        <Popup>
                            <div className="space-y-1 min-w-[120px]">
                                <div className="font-bold text-blue-600 flex items-center justify-between">
                                    Available
                                    {task.distance !== undefined && (
                                        <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-700">
                                            {task.distance < 1 ? `${(task.distance * 1000).toFixed(0)}m` : `${task.distance.toFixed(1)}km`}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs font-semibold">{task.user?.name}</div>
                                <div className="text-[10px] text-gray-500">{task.address?.street}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Assigned Pickup Markers */}
                {assignedTasks.map((task, index) => (
                    <Marker
                        key={task.id}
                        position={[task.pickupLat, task.pickupLng]}
                        icon={assignedIcon}
                    >
                        <Popup>
                            <div className="space-y-1 min-w-[120px]">
                                <div className="font-bold text-green-600 flex items-center justify-between">
                                    Stop #{index + 1}
                                    {task.distance !== undefined && (
                                        <span className="text-[10px] bg-green-50 px-1.5 py-0.5 rounded text-green-700">
                                            {task.distance < 1 ? `${(task.distance * 1000).toFixed(0)}m` : `${task.distance.toFixed(1)}km`}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs font-semibold">{task.user?.name}</div>
                                <div className="text-[10px] text-gray-500 font-medium">{task.address?.street}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Optimized Road Route */}
                {roadPoints.length > 1 && (
                    <Polyline
                        positions={roadPoints}
                        color="#22c55e"
                        weight={5}
                        opacity={1}
                        dashArray="5, 8"
                        lineCap="round"
                    >
                        <Popup>Optimized Road Path</Popup>
                    </Polyline>
                )}

                <MapUpdater center={center} />
            </MapContainer>
        </div>
    );
}
