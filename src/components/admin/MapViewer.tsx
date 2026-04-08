'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons not loading in Next.js/Webpack
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

if (typeof window !== 'undefined') {
    L.Marker.prototype.options.icon = defaultIcon;
}

export interface MapLocation {
    id: string;
    lat: number;
    lng: number;
    name: string;
    description?: string;
    radiusKm?: number;
    color?: string;
}

export default function MapViewer({ locations, center = [20.5937, 78.9629], zoom = 5 }: { locations: MapLocation[], center?: [number, number], zoom?: number }) {
    // Determine bounds or center based on first location
    const mapCenter = locations.length > 0 ? [locations[0].lat, locations[0].lng] as [number, number] : center;
    const mapZoom = locations.length > 0 ? 10 : zoom;

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '400px', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                {/* Use a dark theme map styling alternative like CartoDB dark matter to match app theme */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {locations.map(loc => (
                    <React.Fragment key={loc.id}>
                        <Marker position={[loc.lat, loc.lng]}>
                            <Popup>
                                <div className="font-semibold text-sm text-black">{loc.name}</div>
                                {loc.description && <div className="text-xs text-gray-500">{loc.description}</div>}
                            </Popup>
                        </Marker>
                        {loc.radiusKm && (
                            <Circle 
                                center={[loc.lat, loc.lng]} 
                                radius={loc.radiusKm * 1000} 
                                pathOptions={{ 
                                    color: loc.color || '#3b82f6', 
                                    fillColor: loc.color || '#3b82f6', 
                                    fillOpacity: 0.2,
                                    weight: 2
                                }} 
                            />
                        )}
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
}
