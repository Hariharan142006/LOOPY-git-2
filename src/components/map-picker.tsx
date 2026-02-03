'use client';

import { useState, useCallback, useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    initialLat?: number;
    initialLng?: number;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Default center (India)
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};

const libraries: any[] = ["places"];

export interface MapPickerHandle {
    panToCurrentLocation: () => void;
}

const MapPicker = forwardRef<MapPickerHandle, MapPickerProps>(({ onLocationSelect, initialLat, initialLng }, ref) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);

    // Initialize marker position from props
    useEffect(() => {
        if (initialLat && initialLng) {
            setMarkerPosition({ lat: initialLat, lng: initialLng });
        }
    }, [initialLat, initialLng]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        // If we have an initial position, pan to it
        if (initialLat && initialLng) {
            const bounds = new window.google.maps.LatLngBounds({ lat: initialLat, lng: initialLng });
            map.fitBounds(bounds);
            map.setZoom(15);
        }
    }, [initialLat, initialLng]);

    const onUnmount = useCallback((map: google.maps.Map) => {
        setMap(null);
    }, []);

    const fetchAddress = useCallback(async (lat: number, lng: number) => {
        // Try Google Geocoder first
        if (window.google && window.google.maps) {
            try {
                const geocoder = new window.google.maps.Geocoder();
                const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
                    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            resolve(results[0]);
                        } else {
                            reject(status);
                        }
                    });
                });

                onLocationSelect(lat, lng, result.formatted_address);
                return;
            } catch (error) {
                console.warn("Google Geocoder failed, falling back to Nominatim:", error);
            }
        }

        // Fallback to Nominatim (OpenStreetMap)
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

    useImperativeHandle(ref, () => ({
        panToCurrentLocation: () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude: lat, longitude: lng } = position.coords;
                        setMarkerPosition({ lat, lng });
                        if (map) {
                            map.panTo({ lat, lng });
                            map.setZoom(17);
                        }
                        fetchAddress(lat, lng);
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                    },
                    { enableHighAccuracy: true }
                );
            }
        }
    }));

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });
            fetchAddress(lat, lng);
        }
    }, [fetchAddress]);

    const center = useMemo(() => {
        if (initialLat && initialLng) {
            return { lat: initialLat, lng: initialLng };
        }
        return defaultCenter;
    }, [initialLat, initialLng]);

    if (loadError) {
        return (
            <div className="h-[400px] w-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-red-400 border border-white/10 p-4 text-center">
                <p className="font-bold text-lg mb-2">Google Maps Error</p>
                <p className="mb-4">{loadError.message}</p>
                <div className="text-sm text-gray-400 bg-black/30 p-4 rounded text-left max-w-md">
                    <p className="font-semibold mb-1">Possible Fixes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Enable Billing on your Google Cloud Project.</li>
                        <li>Enable "Maps JavaScript API".</li>
                        <li>Enable "Geocoding API".</li>
                        <li>Check console for specific error codes.</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-[400px] w-full bg-gray-900 animate-pulse rounded-lg flex items-center justify-center text-gray-500 border border-white/10">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading Maps...
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-white/20 relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={initialLat ? 15 : 5}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onMapClick}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    styles: [
                        // Dark mode style for the map to match app theme
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ]
                }}
            >
                {markerPosition && (
                    <Marker position={markerPosition} />
                )}
            </GoogleMap>
        </div>
    );
});

MapPicker.displayName = "MapPicker";
export default MapPicker;
