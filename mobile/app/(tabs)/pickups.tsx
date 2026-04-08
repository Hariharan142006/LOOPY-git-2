import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';
import { LoopyColors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function AgentPickupsMap() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [agentLoc, setAgentLoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    const fetchData = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            setAgentLoc(loc.coords);
            
            // Post location and get optimized tasks
            const res = await api.post('/api/agent/tasks', {
                lat: loc.coords.latitude,
                lng: loc.coords.longitude
            });
            setTasks(res.data.accepted || []);
        } catch (e) {
            console.log('Pickups Fetch Error', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
             const { status } = await Location.requestForegroundPermissionsAsync();
             if (status !== 'granted') return;
             fetchData();
        })();
    }, []);

    const zoomToFit = () => {
        if (!mapRef.current || tasks.length === 0) return;
        const coords = tasks.map(t => ({ latitude: t.pickupLat, longitude: t.pickupLng }));
        if (agentLoc) coords.push({ latitude: agentLoc.latitude, longitude: agentLoc.longitude });
        
        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 100, right: 50, bottom: 250, left: 50 },
            animated: true
        });
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={LoopyColors.green} /></View>;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation
                onLayout={zoomToFit}
            >
                {tasks.map((task, index) => (
                    <Marker
                        key={task.id}
                        coordinate={{ latitude: task.pickupLat, longitude: task.pickupLng }}
                        onPress={() => setSelectedTask(task)}
                    >
                        <View style={[styles.markerContainer, { backgroundColor: task.status === 'ONEWAY' ? '#8b5cf6' : LoopyColors.green }]}>
                            <Text style={styles.markerText}>{index + 1}</Text>
                        </View>
                    </Marker>
                ))}

                {tasks.length > 1 && (
                    <Polyline
                        coordinates={[
                            ...(agentLoc ? [{ latitude: agentLoc.latitude, longitude: agentLoc.longitude }] : []),
                            ...tasks.map(t => ({ latitude: t.pickupLat, longitude: t.pickupLng }))
                        ]}
                        strokeColor={LoopyColors.green}
                        strokeWidth={3}
                        lineDashPattern={[5, 5]}
                    />
                )}
            </MapView>

            <View style={styles.overlay}>
                <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
                    <Ionicons name="refresh" size={20} color={LoopyColors.charcoal} />
                </TouchableOpacity>

                {selectedTask ? (
                    <Animated.View entering={SlideInDown} style={styles.taskCard}>
                        <View style={styles.cardHeader}>
                             <View>
                                <Text style={styles.customerName}>{selectedTask.user?.name}</Text>
                                <Text style={styles.taskStatus}>{selectedTask.status.replace('_', ' ')}</Text>
                             </View>
                             <TouchableOpacity onPress={() => setSelectedTask(null)}>
                                <Ionicons name="close" size={24} color={LoopyColors.grey} />
                             </TouchableOpacity>
                        </View>
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: LoopyColors.grey, textTransform: 'uppercase', marginBottom: 4 }}>Pickup Address</Text>
                            <Text style={styles.addressText} numberOfLines={2}>{selectedTask.address?.street}, {selectedTask.address?.city}</Text>
                        </View>
                        
                        <View style={styles.cardActions}>
                            <TouchableOpacity 
                                style={styles.primaryBtn} 
                                onPress={() => router.push(`/track-route/${selectedTask.id}` as any)}
                            >
                                <Ionicons name="navigate" size={18} color="#fff" />
                                <Text style={styles.btnText}>Start Pickup</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.secondaryBtn}
                                onPress={() => Alert.alert('Stats', `Estimated payout: ₹${selectedTask.totalAmount.toFixed(2)}`)}
                            >
                                <Ionicons name="information-circle-outline" size={22} color={LoopyColors.charcoal} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                ) : (
                    <View style={styles.summaryCard}>
                         <View style={styles.summaryItem}>
                            <Text style={styles.summaryVal}>{tasks.length}</Text>
                            <Text style={styles.summaryLabel}>Remaining</Text>
                         </View>
                         <View style={styles.summaryDivider} />
                         <View style={styles.summaryItem}>
                            <Text style={styles.summaryVal}>{tasks.reduce((acc, t) => acc + (t.totalAmount || 0), 0)}</Text>
                            <Text style={styles.summaryLabel}>Est. Payout</Text>
                         </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { flex: 1 },
    overlay: { position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 30, left: 16, right: 16, gap: 16 },
    refreshBtn: { alignSelf: 'flex-end', width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
    markerContainer: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', elevation: 3 },
    markerText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    taskCard: { backgroundColor: '#fff', borderRadius: 28, padding: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    customerName: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal },
    taskStatus: { fontSize: 11, fontWeight: '700', color: LoopyColors.green, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
    addressText: { fontSize: 14, color: LoopyColors.grey, marginBottom: 16 },
    cardActions: { flexDirection: 'row', gap: 12 },
    primaryBtn: { flex: 1, flexDirection: 'row', backgroundColor: LoopyColors.charcoal, borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
    secondaryBtn: { width: 54, height: 54, borderRadius: 16, backgroundColor: LoopyColors.lightGrey, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    summaryCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryVal: { fontSize: 20, fontWeight: '900', color: LoopyColors.charcoal },
    summaryLabel: { fontSize: 11, color: LoopyColors.grey, fontWeight: '600', marginTop: 2 },
    summaryDivider: { width: 1, height: 30, backgroundColor: '#e5e7eb' }
});
