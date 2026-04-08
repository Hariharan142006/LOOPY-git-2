import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import * as Location from 'expo-location';

export default function AgentRouteScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [agentLocation, setAgentLocation] = useState<any>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [notified, setNotified] = useState(false);
    const [rideStarted, setRideStarted] = useState(false);

    const fetchTaskData = async () => {
        try {
            const res = await api.get(`/api/agent/tasks`);
            const currentTask = res.data.accepted.find((b: any) => b.id === id);
            if (currentTask) {
                setBooking(currentTask);
                if (currentTask.status === 'ONEWAY' || currentTask.status === 'ARRIVED') {
                    setRideStarted(true);
                }
            }
        } catch (e) {
            console.log('Task Error', e);
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // in metres
    };

    const startRide = async () => {
        try {
            await api.post('/api/agent/tasks/update', { bookingId: id, action: 'STATUS', status: 'ONEWAY' });
            setRideStarted(true);
            Alert.alert("Ride Started", "Customer can now see your live location.");
        } catch (e) {
            Alert.alert("Error", "Could not start ride.");
        }
    };

    useEffect(() => {
        fetchTaskData();
        
        let subscription: any;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 5 },
                (loc) => {
                    setAgentLocation(loc.coords);
                    
                    // Share live location if ride started
                    if (rideStarted) {
                        api.post('/api/agent/location', { lat: loc.coords.latitude, lng: loc.coords.longitude }).catch(() => {});
                    }

                    if (booking) {
                        const d = calculateDistance(loc.coords.latitude, loc.coords.longitude, booking.pickupLat, booking.pickupLng);
                        setDistance(d);
                        
                        // 2m Proximity Alert
                        if (d < 2 && !notified) {
                            setNotified(true);
                            api.post(`/api/bookings/${id}/proximity`, { distance: d }).catch(console.log);
                            Alert.alert("Near Target", "You are within 2m of the customer.");
                        }
                    }
                }
            );
        })();

        return () => {
            if (subscription) subscription.remove();
        };
    }, [booking, notified, rideStarted]);

    const openInMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.pickupLat},${booking.pickupLng}&travelmode=driving`;
        Linking.openURL(url);
    };

    if (loading || !booking) return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Route to Pickup</Text>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: (booking.pickupLat + (agentLocation?.latitude || booking.pickupLat)) / 2,
                    longitude: (booking.pickupLng + (agentLocation?.longitude || booking.pickupLng)) / 2,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {agentLocation && (
                    <Marker
                        coordinate={{ latitude: agentLocation.latitude, longitude: agentLocation.longitude }}
                        title="My Location"
                    >
                        <View style={styles.agentMarker}>
                            <Ionicons name="bicycle" size={20} color="#fff" />
                        </View>
                    </Marker>
                )}

                <Marker
                    coordinate={{ latitude: booking.pickupLat, longitude: booking.pickupLng }}
                    title="Customer Location"
                    pinColor="#ef4444"
                />
            </MapView>

            <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.customerName}>{booking.user?.name}</Text>
                        <Text style={styles.addressText}>{booking.address?.street}</Text>
                        <Text style={styles.priceText}>Est. Payout: ₹{(booking.totalAmount || 0).toFixed(2)}</Text>
                    </View>
                    {distance !== null && (
                        <View style={styles.distanceBadge}>
                            <Text style={styles.distanceText}>{distance > 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance.toFixed(0)}m`}</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.actionContainer}>
                    {!rideStarted && (
                        <TouchableOpacity style={[styles.startRideBtn, { marginBottom: 12 }]} onPress={startRide}>
                            <Ionicons name="play" size={20} color="#fff" />
                            <Text style={styles.btnText}>Start Ride</Text>
                        </TouchableOpacity>
                    )}
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.navigateBtn} onPress={openInMaps}>
                            <Ionicons name="navigate" size={20} color="#fff" />
                            <Text style={styles.btnText}>Maps</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.callBtn} 
                            onPress={() => Linking.openURL(`tel:${booking.user?.phone}`)}
                        >
                            <Ionicons name="call" size={24} color="#10b981" />
                        </TouchableOpacity>
                    </View>
                </View>


                {rideStarted && distance !== null && distance < 50 && (
                    <TouchableOpacity 
                        style={styles.arrivedBtn} 
                        onPress={async () => {
                            await api.post('/api/agent/tasks/update', { bookingId: id, action: 'STATUS', status: 'ARRIVED' });
                            router.push(`/weigh/${id}` as any);
                        }}
                    >
                        <Ionicons name="pin" size={18} color="#fff" />
                        <Text style={styles.btnText}>I have Arrived</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, color: '#111827', backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    map: { flex: 1 },
    infoCard: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    customerName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    addressText: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    priceText: { fontSize: 13, color: '#10b981', fontWeight: '800', marginTop: 4 },
    distanceBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#d1fae5' },
    distanceText: { fontSize: 12, fontWeight: '800', color: '#10b981' },
    startRideBtn: { flexDirection: 'row', backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionRow: { flexDirection: 'row', gap: 12 },
    actionContainer: { marginTop: 4 },
    navigateBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
    arrivedBtn: { flexDirection: 'row', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
    btnText: { color: '#fff', fontWeight: 'bold' },
    callBtn: { width: 54, height: 54, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d1fae5' },

    agentMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }
});
