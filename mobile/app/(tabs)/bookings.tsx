import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts } from '../../constants/theme';

export default function BookingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);



  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/user/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.log('Error fetching bookings', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 20000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#f59e0b';
      case 'ASSIGNED': return '#3b82f6';
      case 'ONEWAY': return '#10b981';
      case 'ARRIVED': return '#8b5cf6';
      case 'PAID': return '#10b981';
      case 'COMPLETED': return '#059669';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderBookingItem = ({ item, index }: any) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100)} 
      style={styles.bookingCard}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.bookingId}>Pickup #{item.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.bookingDate}>{new Date(item.scheduledAt).toLocaleDateString()} at {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.locationIconBox}>
            <Ionicons name="location" size={14} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>Pickup Location</Text>
            <Text style={styles.infoText} numberOfLines={3}>{item.address?.street}, {item.address?.city}</Text>
          </View>
        </View>
        {item.totalAmount > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#059669" />
            <Text style={[styles.infoText, { color: '#059669', fontWeight: 'bold' }]}>Earned: ₹{(item.totalAmount || 0).toFixed(2)}</Text>

          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.detailsBtn}
        onPress={() => router.push(`/track/${item.id}` as any)}
      >
        <Text style={styles.detailsBtnText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#10b981" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#f3f4f6" />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySubtitle}>Schedule your first scrap pickup today!</Text>
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => router.push('/book')}>
              <Text style={styles.bookNowText}>Book a Pickup</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20 },
  bookingCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  bookingId: { fontSize: 16, fontFamily: Fonts.bold, color: '#111827' },
  bookingDate: { fontSize: 12, fontFamily: Fonts.medium, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: Fonts.bold, textTransform: 'uppercase' },
  cardBody: { gap: 12, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  locationLabel: { fontSize: 10, fontFamily: Fonts.bold, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 },
  infoText: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#1f2937', lineHeight: 18 },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16, gap: 4 },
  detailsBtnText: { fontSize: 14, fontFamily: Fonts.bold, color: '#10b981' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 22, fontFamily: Fonts.bold, color: '#111827', marginTop: 20 },
  emptySubtitle: { fontSize: 14, fontFamily: Fonts.regular, color: '#6b7280', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  bookNowBtn: { backgroundColor: '#10b981', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 18, marginTop: 30 },
  bookNowText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: Fonts.bold, color: '#111827' },
  logisticsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.bold, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  porterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  porterInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  porterAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontFamily: Fonts.bold },
  porterName: { fontSize: 16, fontFamily: Fonts.bold, color: '#111827' },
  porterSub: { fontSize: 12, fontFamily: Fonts.regular, color: '#6b7280' },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  pendingPorterCard: { padding: 20, backgroundColor: '#fffbeb', borderRadius: 20, borderWidth: 1, borderColor: '#fef3c7', alignItems: 'center', flexDirection: 'row', gap: 12 },
  pendingPorterText: { color: '#b45309', fontSize: 14, fontFamily: Fonts.medium },
  detailsSection: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 24, marginBottom: 24 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 15, fontFamily: Fonts.regular, color: '#111827' },
  itemQty: { fontSize: 15, fontFamily: Fonts.bold, color: '#111827' },
  emptyItemsText: { color: '#6b7280', fontStyle: 'italic', fontFamily: Fonts.regular },
  locationText: { fontSize: 15, fontFamily: Fonts.regular, color: '#4b5563', lineHeight: 22 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 20 },
  totalLabel: { fontSize: 18, fontFamily: Fonts.bold, color: '#111827' },
  totalVal: { fontSize: 24, fontFamily: Fonts.bold, color: '#10b981' },
});
