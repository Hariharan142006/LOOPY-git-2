import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { LoopyColors, Fonts } from '../../constants/theme';
import { StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAgent = user?.role === 'AGENT';

  const fetchData = async () => {
    try {
      const endpoints = isAgent 
        ? [api.get('/api/agent/tasks')] 
        : [api.get('/api/user/bookings'), api.get('/api/user/wallet')];

      const responses = await Promise.all(endpoints);
      
      if (isAgent) {
        setData(responses[0].data); // { available, accepted, completed }
      } else {
        setData(responses[0].data.bookings || []);
        setWallet(responses[1].data || null);
      }
    } catch (error) {
      console.log('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);

    // Agent Location Tracking
    let locationSubscription: any;
    if (isAgent) {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
                (location) => {
                    api.post('/api/agent/location', {
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    }).catch(console.log);
                }
            );
        })();
    }

    return () => {
        clearInterval(interval);
        if (locationSubscription) locationSubscription.remove();
    };
  }, [isAgent]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTaskAction = async (bookingId: string, action: 'ACCEPT' | 'STATUS', status?: string) => {
    try {
      await api.post('/api/agent/tasks/update', { bookingId, action, status });
      fetchData();
      if (action === 'ACCEPT') Alert.alert('Success', 'Pickup accepted!');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#f59e0b'; // Amber
      case 'ASSIGNED': return '#3b82f6'; // Blue
      case 'ONEWAY': return '#8b5cf6'; // Violet
      case 'ARRIVED': return '#ec4899'; // Pink
      case 'COMPLETED': return '#10b981'; // Green
      case 'CANCELLED': return '#ef4444'; // Red
      default: return '#6b7280'; // Grey
    }
  };


  const renderActivityItem = ({ item }: any) => (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.activityCard}>
      <View style={[styles.activityIcon, { backgroundColor: item.status === 'COMPLETED' ? '#f0fdf4' : '#f9fafb' }]}>
        <Ionicons 
          name={item.status === 'COMPLETED' ? 'checkmark-circle' : item.status === 'CANCELLED' ? 'close-circle' : 'time'} 
          size={20} 
          color={getStatusColor(item.status)} 
        />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>Pickup #{item.id.slice(-4).toUpperCase()}</Text>
        <Text style={styles.activityDate}>{new Date(item.scheduledAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.activityAmount}>
        <Text style={styles.amountText}>₹{(item.totalAmount || 0).toFixed(0)}</Text>
        <Text style={[styles.activityDate, { color: getStatusColor(item.status), fontWeight: '700' }]}>{item.status}</Text>
      </View>
    </Animated.View>
  );

  const renderAgentTask = (item: any, type: 'AVAILABLE' | 'ACCEPTED') => (
    <Animated.View entering={FadeInUp} style={styles.agentTaskCard} key={item.id}>
        <View style={styles.taskHeader}>
            <View style={styles.taskTypeBadge}>
                <Text style={styles.taskTypeText}>{item.address?.label || 'Pickup'}</Text>
            </View>
            <Text style={styles.taskDistance}>{item.distance ? `${item.distance.toFixed(1)} km` : 'Local'}</Text>
        </View>

        <View style={styles.taskBody}>
            <Text style={styles.taskAddress}>{item.address?.street}, {item.address?.city}</Text>
            <Text style={styles.taskUser}><Ionicons name="person" size={12} /> {item.user?.name}</Text>
            <Text style={styles.taskTime}><Ionicons name="time" size={12} /> {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        <View style={styles.taskFooter}>
            {type === 'AVAILABLE' ? (
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleTaskAction(item.id, 'ACCEPT')}>
                    <Text style={styles.acceptBtnText}>Accept Pickup</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.actionRow}>
                    {item.status === 'ASSIGNED' && (
                        <TouchableOpacity style={styles.statusBtnPrimary} onPress={() => {
                            handleTaskAction(item.id, 'STATUS', 'ONEWAY');
                            router.push(`/track-route/${item.id}` as any);
                        }}>
                            <Ionicons name="navigate" size={18} color="#fff" />
                            <Text style={styles.statusBtnText}>On the Way</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'ONEWAY' && (
                        <TouchableOpacity style={[styles.statusBtnPrimary, { backgroundColor: '#8b5cf6' }]} onPress={() => handleTaskAction(item.id, 'STATUS', 'ARRIVED')}>
                            <Ionicons name="pin" size={18} color="#fff" />
                            <Text style={styles.statusBtnText}>Arrived</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'ARRIVED' && (
                         <TouchableOpacity style={[styles.statusBtnPrimary, { backgroundColor: '#10b981' }]} onPress={() => router.push(`/weigh/${item.id}` as any)}>
                            <Ionicons name="scale" size={18} color="#fff" />
                            <Text style={styles.statusBtnText}>Start Weighing</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Calling', `Dialing ${item.user?.phone}`)}>
                        <Ionicons name="call" size={20} color={LoopyColors.charcoal} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    </Animated.View>
  );

  return isAgent ? (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.agentHeaderTop}>
            <View>
                <Text style={styles.greetingHeader}>Agent <Text style={styles.nameHeader}>{user?.name?.split(' ')[0]}</Text></Text>
                <Text style={styles.subGreeting}>Your performance for today 📈</Text>
            </View>
            <TouchableOpacity style={styles.onlineStatusBtn}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.onlineText}>ONLINE</Text>
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LoopyColors.green} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.agentStatsGrid}>
           <Animated.View entering={FadeInUp.delay(100)} style={styles.agentStatCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#f0fdf4' }]}>
                 <Ionicons name="wallet-outline" size={20} color={LoopyColors.green} />
              </View>
              <Text style={styles.agentStatLabel}>Earnings</Text>
              <Text style={styles.agentStatVal}>₹{(data?.summary?.todayEarnings || 0).toFixed(0)}</Text>
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(200)} style={styles.agentStatCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#eff6ff' }]}>
                 <Ionicons name="checkmark-done-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.agentStatLabel}>Pickups</Text>
              <Text style={styles.agentStatVal}>{data?.summary?.todayCompleted || 0}</Text>
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(300)} style={styles.agentStatCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#fff7ed' }]}>
                 <Ionicons name="list-outline" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.agentStatLabel}>Queued</Text>
              <Text style={styles.agentStatVal}>{data?.summary?.assignedCount || 0}</Text>
           </Animated.View>
        </View>

        <View style={styles.agentSection}>
           <View style={styles.sectionHeaderRow}>
               <Text style={styles.sectionHeader}>Active Queue</Text>
               <TouchableOpacity onPress={() => router.push('/pickups' as any)} style={styles.viewMapBadge}>
                    <Ionicons name="map" size={14} color={LoopyColors.green} />
                    <Text style={styles.viewMapText}>Map</Text>
               </TouchableOpacity>
           </View>
           {(!data?.accepted || data.accepted.length === 0) ? (
              <View style={styles.emptyCard}>
                  <Ionicons name="bicycle-outline" size={40} color="#f3f4f6" />
                  <Text style={styles.emptyCardText}>No active tasks</Text>
              </View>
           ) : (
              data.accepted.map((item: any) => renderAgentTask(item, 'ACCEPTED'))
           )}
        </View>

        <View style={styles.agentSection}>
           <Text style={styles.sectionHeader}>Nearby Marketplace</Text>
           {(!data?.available || data.available.length === 0) ? (
              <View style={styles.emptyCard}>
                  <Ionicons name="search-outline" size={40} color="#f3f4f6" />
                  <Text style={styles.emptyCardText}>No pickups nearby</Text>
              </View>
           ) : (
              data.available.map((item: any) => renderAgentTask(item, 'AVAILABLE'))
           )}
        </View>
      </ScrollView>
    </View>
  ) : (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View entering={FadeInUp} style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greetingHeader}>Hello, <Text style={styles.nameHeader}>{user?.name?.split(' ')[0] || 'User'}</Text></Text>
            <Text style={styles.subGreeting}>Environmental impact starts here 🌍</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
             <Ionicons name="notifications-outline" size={22} color={LoopyColors.charcoal} />
             <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LoopyColors.green} />}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.statsContainer}>
          <Animated.View entering={FadeInRight.delay(200)} style={styles.walletCard}>
             <View style={styles.cardHeaderSmall}>
                <View style={styles.miniIconBg}><Ionicons name="wallet" size={12} color={LoopyColors.green} /></View>
                <Text style={styles.statsLabel}>WALLET BALANCE</Text>
             </View>
             <Text style={styles.balanceText}>₹{(wallet?.balance || 0).toFixed(2)}</Text>
             <TouchableOpacity style={styles.withdrawBtn} onPress={() => router.push('/wallet')}>
                <Text style={styles.withdrawBtnText}>Cash Out</Text>
                <Ionicons name="arrow-forward" size={12} color={LoopyColors.green} />
             </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(400)} style={styles.impactCard}>
             <View style={styles.cardHeaderSmall}>
                <View style={[styles.miniIconBg, { backgroundColor: '#dcfce7' }]}><Ionicons name="leaf" size={12} color="#059669" /></View>
                <Text style={[styles.statsLabel, { color: '#059669' }]}>IMPACT</Text>
             </View>
             <Text style={styles.impactVal}>{wallet?.impact?.kgRecycled || 0} KG</Text>
             <Text style={styles.impactSub}>Recycled Total</Text>
          </Animated.View>
        </View>

        <View style={styles.actionsGrid}>
           <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/book')}>
              <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                 <Ionicons name="add-circle" size={32} color={LoopyColors.green} />
              </View>
              <Text style={styles.actionTitle}>Book Pickup</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/rates')}>
              <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                 <Ionicons name="pricetag" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.actionTitle}>Daily Rates</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/history')}>
              <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
                 <Ionicons name="time" size={28} color="#f59e0b" />
              </View>
              <Text style={styles.actionTitle}>History</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.activitySection}>
           <View style={styles.sectionHeaderRow}>
               <Text style={styles.sectionHeader}>Recent Activity</Text>
               <TouchableOpacity onPress={() => router.push('/history')}>
                    <Text style={styles.seeAllText}>See All</Text>
               </TouchableOpacity>
           </View>
           <View style={styles.activityList}>
              {(!wallet?.transactions || wallet.transactions.length === 0) ? (
                 <View style={styles.emptyCard}>
                    <Ionicons name="receipt-outline" size={32} color="#d1d5db" />
                    <Text style={styles.emptyCardText}>No recent activity</Text>
                 </View>
              ) : (
                 wallet.transactions.slice(0, 3).map((item: any, idx: number) => (
                    <Animated.View 
                       key={item.id} 
                       entering={FadeInDown.delay(600 + (idx * 100))} 
                       style={styles.activityCard}
                    >
                       <View style={[styles.activityIcon, { backgroundColor: item.type === 'CREDIT' ? '#f0fdf4' : '#fef2f2' }]}>
                          <Ionicons 
                             name={item.type === 'CREDIT' ? "arrow-down" : "arrow-up"} 
                             size={18} 
                             color={item.type === 'CREDIT' ? LoopyColors.green : LoopyColors.red} 
                          />
                       </View>
                       <View style={styles.activityInfo}>
                          <Text style={styles.activityTitle}>{item.description || (item.type === 'CREDIT' ? 'Funds Added' : 'Withdrawal')}</Text>
                          <Text style={styles.activityDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                       </View>
                       <View style={styles.activityAmount}>
                          <Text style={[styles.amountText, { color: item.type === 'CREDIT' ? '#059669' : LoopyColors.red }]}>
                             {item.type === 'CREDIT' ? '+' : '-'}₹{(item.amount || 0).toFixed(0)}
                          </Text>
                       </View>
                    </Animated.View>
                 ))
              )}
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 60, marginBottom: 16 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingHeader: { fontSize: 24, fontFamily: Fonts.bold, color: LoopyColors.charcoal, letterSpacing: -0.8 },
  nameHeader: { color: LoopyColors.green },
  subGreeting: { fontSize: 13, fontFamily: Fonts.semiBold, color: LoopyColors.grey, marginTop: 2, opacity: 0.8 },
  notifBtn: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  notifDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: LoopyColors.red, borderWidth: 2, borderColor: '#fff' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  walletCard: { flex: 1.2, backgroundColor: '#fff', borderRadius: 32, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 15 },
  cardHeaderSmall: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  miniIconBg: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  statsLabel: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.green, letterSpacing: 0.5 },
  balanceText: { fontSize: 30, fontFamily: Fonts.bold, color: LoopyColors.charcoal, marginBottom: 12, letterSpacing: -1 },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.9 },
  withdrawBtnText: { fontSize: 12, fontFamily: Fonts.bold, color: LoopyColors.green },
  impactCard: { flex: 0.8, backgroundColor: '#f0fdf4', borderRadius: 32, padding: 20, justifyContent: 'center', borderWidth: 1, borderColor: '#dcfce7' },
  impactVal: { fontSize: 22, fontFamily: Fonts.bold, color: '#065f46' },
  impactSub: { fontSize: 11, fontFamily: Fonts.bold, color: '#059669', marginTop: 2 },
  actionsGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  actionItem: { flex: 1, backgroundColor: '#fff', borderRadius: 28, paddingVertical: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  actionIcon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionTitle: { fontSize: 13, fontFamily: Fonts.bold, color: LoopyColors.charcoal },
  activitySection: { paddingHorizontal: 24, marginBottom: 40 },
  sectionHeader: { fontSize: 18, fontFamily: Fonts.bold, color: LoopyColors.charcoal, letterSpacing: -0.5 },
  seeAllText: { fontSize: 13, fontFamily: Fonts.bold, color: LoopyColors.grey },
  activityList: { gap: 12 },
  activityCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 24, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5 },
  activityIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1, marginLeft: 12 },
  activityTitle: { fontSize: 14, fontFamily: Fonts.bold, color: LoopyColors.charcoal },
  activityDate: { fontSize: 12, fontFamily: Fonts.medium, color: LoopyColors.grey, marginTop: 2 },
  activityAmount: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontFamily: Fonts.bold },
  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 40, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 28 },
  emptyCardText: { color: '#9ca3af', fontSize: 14, marginTop: 10, fontFamily: Fonts.bold },
  agentHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  onlineStatusBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: '#dcfce7' },
  onlineIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: LoopyColors.green, marginRight: 6 },
  onlineText: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.green, letterSpacing: 0.5 },
  agentStatsGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  agentStatCard: { flex: 1, backgroundColor: '#fff', borderRadius: 28, padding: 16, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
  statIconCircle: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  agentStatVal: { fontSize: 20, fontFamily: Fonts.bold, color: LoopyColors.charcoal },
  agentStatLabel: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.grey, textTransform: 'uppercase', marginBottom: 2, opacity: 0.6 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewMapBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  viewMapText: { fontSize: 13, fontFamily: Fonts.bold, color: LoopyColors.green },
  agentSection: { paddingHorizontal: 24, marginBottom: 32 },
  agentTaskCard: { backgroundColor: '#fff', borderRadius: 28, padding: 18, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  taskTypeBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  taskTypeText: { color: '#059669', fontSize: 10, fontFamily: Fonts.bold, textTransform: 'uppercase' },
  taskDistance: { color: LoopyColors.green, fontSize: 12, fontFamily: Fonts.bold },
  taskBody: { gap: 8, marginBottom: 18 },
  taskAddress: { fontSize: 18, fontFamily: Fonts.bold, color: LoopyColors.charcoal, letterSpacing: -0.5 },
  taskUser: { fontSize: 14, fontFamily: Fonts.semiBold, color: LoopyColors.grey },
  taskTime: { fontSize: 14, fontFamily: Fonts.semiBold, color: LoopyColors.grey },
  taskFooter: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 18 },
  acceptBtn: { backgroundColor: LoopyColors.green, paddingVertical: 16, borderRadius: 20, alignItems: 'center', elevation: 4, shadowColor: LoopyColors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  acceptBtnText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 15 },
  actionRow: { flexDirection: 'row', gap: 12 },
  statusBtnPrimary: { flex: 1, flexDirection: 'row', backgroundColor: LoopyColors.blue, paddingVertical: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  statusBtnText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 15 },
  callBtn: { width: 52, height: 52, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
});

