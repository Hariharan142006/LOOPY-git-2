import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, Dimensions, Alert, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { LoopyColors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/layout';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
        setData(responses[0].data);
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
        <ActivityIndicator size="large" color={LoopyColors.green} />
      </View>
    );
  }

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LoopyColors.green} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <View style={styles.agentHeaderTop}>
              <View>
                  <Text style={styles.greetingHeader}>{t('agent_greeting')} <Text style={styles.nameHeader}>{user?.name?.split(' ')[0]}</Text></Text>
                  <Text style={styles.subGreeting}>{t('today_performance')}</Text>
              </View>
              <TouchableOpacity style={styles.onlineStatusBtn}>
                  <View style={styles.onlineIndicator} />
                  <Text style={styles.onlineText}>ONLINE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.agentAvatarBtn} onPress={() => router.push('/profile' as any)}>
                 <Image 
                    source={user?.image ? { uri: user.image } : require('../../assets/images/user-placeholder.png')} 
                    style={styles.avatarMini} 
                 />
              </TouchableOpacity>
          </View>
        </View>

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
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LoopyColors.green} />}
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        <Animated.View entering={FadeInUp} style={styles.customerHeader}>
          <View style={styles.customerHeaderTopRow}>
            <TouchableOpacity style={styles.avatarHolder} onPress={() => router.push('/profile' as any)}>
               <Image 
                  source={user?.image ? { uri: user.image } : require('../../assets/images/user-placeholder.png')} 
                  style={styles.avatarMini} 
               />
            </TouchableOpacity>
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.welcomeBackText}>{t('greeting').toUpperCase()} BACK</Text>
              <Text style={styles.greetingHeader}>{t('greeting')}, <Text style={styles.nameHeaderGreen}>{user?.name?.split(' ')[0] || 'User'}</Text></Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtnGreen}>
               <Ionicons name="notifications" size={20} color="#065f46" />
               <View style={styles.notifDotGreen} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: 24, gap: 20, marginBottom: 32 }}>
           <Animated.View entering={FadeInRight.delay(200)} style={styles.walletCardFull}>
              <Text style={styles.walletLabel}>WALLET BALANCE</Text>
              <Text style={styles.walletBalanceText}>₹{(wallet?.balance || 24035.60).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              <TouchableOpacity style={styles.cashOutBtnFull} onPress={() => router.push('/wallet' as any)}>
                 <Ionicons name="cash-outline" size={16} color="#065f46" style={{ marginRight: 8 }} />
                 <Text style={styles.cashOutBtnTextFull}>Cash Out</Text>
              </TouchableOpacity>
           </Animated.View>

           <Animated.View entering={FadeInRight.delay(400)} style={styles.impactCardFull}>
              <View style={styles.impactIconBg}><Ionicons name="leaf" size={18} color="#fff" /></View>
              <Text style={styles.impactValBig}>{wallet?.impact?.kgRecycled || '519.1'}</Text>
              <Text style={styles.impactSubGreen}>KG RECYCLED TOTAL</Text>
              <Ionicons name="leaf" size={160} color="#15803d" style={styles.watermarkLeaf} />
           </Animated.View>
        </View>

        <View style={styles.quickActionsContainer}>
           <Text style={styles.quickActionsTitle}>QUICK ACTIONS</Text>
           <View style={styles.actionsGridCenter}>
             <TouchableOpacity style={styles.actionItemBox} onPress={() => router.push('/book' as any)}>
                <View style={styles.actionIconCyan}><Ionicons name="car-outline" size={24} color="#fff" /></View>
                <Text style={styles.actionTitleSmall}>Book Pickup</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionItemBox} onPress={() => router.push('/rates' as any)}>
                <View style={styles.actionIconBlue}><Ionicons name="stats-chart" size={24} color="#0f172a" /></View>
                <Text style={styles.actionTitleSmall}>Daily Rates</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionItemBox} onPress={() => router.push('/history' as any)}>
                <View style={styles.actionIconLightGreen}><Ionicons name="time" size={24} color="#065f46" /></View>
                <Text style={styles.actionTitleSmall}>History</Text>
             </TouchableOpacity>
           </View>
        </View>

        <View style={styles.activitySectionCustomer}>
           <View style={styles.sectionHeaderRow}>
               <View>
                  <Text style={styles.sectionHeaderSmall}>RECENT ACTIVITY</Text>
                  <Text style={styles.activitySubtitle}>Updated 2 mins ago</Text>
               </View>
               <TouchableOpacity onPress={() => router.push('/history' as any)}>
                    <Text style={styles.seeAllTextGreen}>See All</Text>
               </TouchableOpacity>
           </View>
           <View style={styles.activityList}>
              {(!wallet?.transactions || wallet.transactions.length === 0) ? (
                 <View style={styles.emptyCard}>
                    <Ionicons name="receipt-outline" size={32} color={LoopyColors.border} />
                    <Text style={styles.emptyCardText}>No recent activity</Text>
                 </View>
              ) : (
                 wallet.transactions.slice(0, 3).map((item: any, idx: number) => (
                    <Animated.View 
                       key={item.id || idx.toString()} 
                       entering={FadeInDown.delay(600 + (idx * 100))} 
                       style={styles.activityCardPill}
                    >
                       <View style={styles.activityIconGrey}>
                          <Ionicons 
                             name={item.type === 'CREDIT' ? "cash" : "leaf"} 
                             size={20} 
                             color={LoopyColors.success} 
                          />
                       </View>
                       <View style={styles.activityInfo}>
                          <Text style={styles.activityTitleFull}>{item.description || 'Payout for Pickup #A5297R'}</Text>
                          <Text style={styles.activityDateFull}>{item.type === 'CREDIT' ? 'Oct 24, 2023 • 2:30 PM' : 'Oct 22, 2023 • 10:15 AM'}</Text>
                       </View>
                       <View style={styles.activityAmountRight}>
                          <Text style={styles.amountTextGreen}>
                             {item.type === 'CREDIT' ? '+' : '-'} ₹{(item.amount || 0).toFixed(2)}
                          </Text>
                          <View style={styles.successBadge}>
                             <Text style={styles.successBadgeText}>{item.type === 'CREDIT' ? 'SUCCESS' : 'LOGGED'}</Text>
                          </View>
                       </View>
                    </Animated.View>
                 ))
              )}
           </View>
        </View>
        
        <View style={styles.promoContainer}>
            <Animated.Image 
               entering={FadeInUp.delay(800)}
               source={require('../../assets/images/promo-bg.png')} 
               style={styles.promoImage} 
            />
            <View style={styles.promoOverlay}>
               <View>
                 <Text style={styles.promoTitle}>Every gram counts</Text>
                 <Text style={styles.promoSubtitle}>Invite friends to earn eco-bonuses.</Text>
               </View>
               <TouchableOpacity style={styles.referBtn}>
                  <Text style={styles.referBtnText}>Refer Now</Text>
               </TouchableOpacity>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header Styles
  header: { paddingHorizontal: 24, paddingTop: 20, marginBottom: 16 },
  customerHeader: { paddingHorizontal: 32, paddingTop: 20, marginBottom: 32 },
  customerHeaderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarHolder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffedd5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  welcomeBackText: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.grey, textTransform: 'uppercase', letterSpacing: 0.5 },
  greetingHeader: { fontSize: 24, fontFamily: Fonts.bold, color: LoopyColors.charcoal, letterSpacing: -0.8 },
  nameHeaderGreen: { color: LoopyColors.success },
  notifBtnGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  notifDotGreen: { position: 'absolute', top: 12, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#065f46', borderWidth: 1.5, borderColor: '#dcfce7' },
  subGreeting: { fontSize: 13, fontFamily: Fonts.semiBold, color: LoopyColors.grey, marginTop: 2, opacity: 0.8 },

  // Wallet
  walletCardFull: { backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  walletLabel: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.grey, letterSpacing: 0.5 },
  walletBalanceText: { fontSize: 36, fontFamily: Fonts.bold, color: LoopyColors.charcoal, marginVertical: 4, letterSpacing: -1 },
  cashOutBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#86efac', paddingVertical: 8, borderRadius: 100, marginTop: 8 },
  cashOutBtnTextFull: { fontSize: 14, fontFamily: Fonts.bold, color: '#065f46' },

  // Impact
  impactCardFull: { backgroundColor: '#166534', borderRadius: 24, padding: 20, position: 'relative', overflow: 'hidden' },
  impactIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  impactValBig: { fontSize: 24, fontFamily: Fonts.bold, color: '#fff' },
  impactSubGreen: { fontSize: 10, fontFamily: Fonts.bold, color: '#86efac', marginTop: 2, letterSpacing: 1 },
  watermarkLeaf: { position: 'absolute', right: -20, bottom: -40, opacity: 0.2 },

  // Actions
  quickActionsContainer: { paddingHorizontal: 32, marginBottom: 40 },
  quickActionsTitle: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.grey, marginBottom: 16, letterSpacing: 0.5 },
  actionsGridCenter: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  actionItemBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 20, paddingVertical: 16, alignItems: 'center' },
  actionIconCyan: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#06b6d4', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionIconBlue: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionIconLightGreen: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#bbf7d0', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionTitleSmall: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.charcoal },

  // Activity
  activitySectionCustomer: { paddingHorizontal: 32, marginBottom: 40 },
  sectionHeader: { fontSize: 18, fontFamily: Fonts.bold, color: LoopyColors.charcoal, letterSpacing: -0.5 },
  sectionHeaderSmall: { fontSize: 10, fontFamily: Fonts.bold, color: LoopyColors.grey, letterSpacing: 0.5 },
  activitySubtitle: { fontSize: 14, fontFamily: Fonts.regular, color: '#6b7280', marginTop: 2 },
  seeAllTextGreen: { fontSize: 14, fontFamily: Fonts.bold, color: LoopyColors.success },
  activityList: { gap: 12 },
  activityCardPill: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 24, marginBottom: 8 },
  activityIconGrey: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1, marginLeft: 12 },
  activityTitleFull: { fontSize: 14, fontFamily: Fonts.bold, color: LoopyColors.charcoal },
  activityDateFull: { fontSize: 12, fontFamily: Fonts.medium, color: LoopyColors.grey, marginTop: 2 },
  activityAmountRight: { alignItems: 'flex-end' },
  amountTextGreen: { fontSize: 14, fontFamily: Fonts.bold, color: '#166534' },
  successBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  successBadgeText: { color: '#166534', fontSize: 8, fontFamily: Fonts.bold },
  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 40, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 28 },
  emptyCardText: { color: '#9ca3af', fontSize: 14, marginTop: 10, fontFamily: Fonts.bold },

  // Promo
  promoContainer: { marginHorizontal: 32, height: 160, borderRadius: 24, overflow: 'hidden', position: 'relative' },
  promoImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  promoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 20, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end' },
  promoTitle: { fontSize: 18, fontFamily: Fonts.bold, color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  promoSubtitle: { fontSize: 10, fontFamily: Fonts.regular, color: '#fff', opacity: 0.9, marginTop: 2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  referBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  referBtnText: { color: '#065f46', fontSize: 10, fontFamily: Fonts.bold },

  // Agent Specific
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
  nameHeader: { color: LoopyColors.green },
  avatarMini: { width: '100%', height: '100%', borderRadius: 20 },
  agentAvatarBtn: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#dcfce7', marginLeft: 12 },
});
