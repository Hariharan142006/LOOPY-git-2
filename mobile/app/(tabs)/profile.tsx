import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LoopyColors } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ pickups: 0, recycled: 0, earned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const isAgent = user?.role === 'AGENT';
        
        if (isAgent) {
           const [agentRes, walletRes] = await Promise.all([
             api.get('/api/agent/tasks'),
             api.get('/api/user/wallet')
           ]);
           const completed = agentRes.data.completed || [];
           setStats({
             pickups: completed.length,
             recycled: completed.reduce((acc: number, b: any) => acc + (b.items?.reduce((ia: number, i: any) => ia + (i.quantity || 0), 0) || 0), 0),
             earned: Math.floor(walletRes.data.balance || 0)
           });
        } else {
           const [bookingsRes, walletRes] = await Promise.all([
             api.get('/api/user/bookings'),
             api.get('/api/user/wallet')
           ]);
           const bookings = bookingsRes.data.bookings || [];
           const completedPickups = bookings.filter((b: any) => b.status === 'COMPLETED').length;
           setStats({
             pickups: completedPickups,
             recycled: walletRes.data.impact?.kgRecycled || 0,
             earned: Math.floor(walletRes.data.balance || 0)
           });
        }
      } catch (error) {
        console.log('Error fetching profile stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to end your current session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          }
        }
      ]
    );
  };

  const MenuItem = ({ icon, label, onPress, color, subValue }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
       <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
       </View>
       <View style={{ flex: 1 }}>
          <Text style={styles.menuText}>{label}</Text>
          {subValue && <Text style={styles.menuSubText}>{subValue}</Text>}
       </View>
       <Ionicons name="chevron-forward" size={18} color={LoopyColors.grey} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <Animated.View entering={FadeInUp} style={styles.header}>
          <View style={styles.avatarWrapper}>
             <View style={styles.avatar}>
               <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
             </View>
             <View style={styles.onlineStatus} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
          {user?.role === 'AGENT' && user?.vehicleType && (
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: LoopyColors.lightGrey, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                <Ionicons name="car-outline" size={14} color={LoopyColors.charcoal} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: LoopyColors.charcoal, marginLeft: 6 }}>Fleet: {user.vehicleType}</Text>
            </View>
          )}
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
           <Animated.View entering={FadeInUp.delay(200)} style={styles.statCard}>
              <Text style={styles.statVal}>{loading ? '--' : stats.pickups}</Text>
              <Text style={styles.statLabel}>Pickups</Text>
           </Animated.View>
           <Animated.View entering={FadeInUp.delay(300)} style={[styles.statCard, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: LoopyColors.lightGrey }]}>
              <Text style={styles.statVal}>{loading ? '--' : stats.recycled}kg</Text>
              <Text style={styles.statLabel}>Recycled</Text>
           </Animated.View>
           <Animated.View entering={FadeInUp.delay(400)} style={styles.statCard}>
              <Text style={styles.statVal}>₹{loading ? '--' : stats.earned}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
           </Animated.View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
           <Text style={styles.sectionTitle}>General</Text>
           <View style={styles.menuGroup}>
              <MenuItem 
                icon="settings-outline" 
                label="Account Setting" 
                color="#8b5cf6" 
                onPress={() => router.push('/account-settings' as any)} 
              />
              <MenuItem 
                icon="person-outline" 
                label="Profile Details" 
                subValue={user?.email}
                color={LoopyColors.green} 
                onPress={() => router.push('/edit-profile' as any)} 
              />
              <MenuItem 
                icon="notifications-outline" 
                label="Languages & Notifications" 
                color="#f59e0b" 
                onPress={() => router.push('/language-notifications' as any)} 
              />
              <MenuItem 
                icon="gift-outline" 
                label="Refer to Earn" 
                color="#ec4899" 
                onPress={() => router.push('/refer-earn' as any)} 
              />
              <MenuItem 
                icon="help-circle-outline" 
                label="Help & Support" 
                color={LoopyColors.blue} 
                onPress={() => router.push('/help-support' as any)} 
              />
              <MenuItem 
                icon="chatbox-ellipses-outline" 
                label="Give me a feedback" 
                color="#06b6d4" 
                onPress={() => router.push('/feedback' as any)} 
              />
           </View>
        </View>

        <View style={styles.menuSection}>
           <Text style={styles.sectionTitle}>More</Text>
           <View style={styles.menuGroup}>
              <MenuItem 
                icon="help-circle-outline" 
                label="Help & support" 
                color={LoopyColors.grey} 
                onPress={() => router.push('/help-support' as any)} 
              />
              <MenuItem 
                icon="shield-checkmark-outline" 
                label="Privacy policy" 
                color="#3b82f6" 
                onPress={() => router.push('/legal?type=privacy' as any)} 
              />
              <MenuItem 
                icon="book-outline" 
                label="Content policy" 
                color="#10b981" 
                onPress={() => router.push('/legal?type=content' as any)} 
              />
              <MenuItem 
                icon="document-text-outline" 
                label="Terms & conditions" 
                color="#6366f1" 
                onPress={() => router.push('/legal?type=terms' as any)} 
              />
              <MenuItem 
                icon="log-out-outline" 
                label="LOGOUT" 
                color={LoopyColors.red} 
                onPress={handleLogout}
              />
           </View>
        </View>

        <Text style={styles.footerText}>Loopy Premium Experience • v1.1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LoopyColors.white },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: LoopyColors.green, alignItems: 'center', justifyContent: 'center', shadowColor: LoopyColors.green, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
  avatarText: { fontSize: 40, fontWeight: '800', color: LoopyColors.white },
  onlineStatus: { position: 'absolute', bottom: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: '#10b981', borderWidth: 4, borderColor: LoopyColors.white },
  userName: { fontSize: 24, fontWeight: '800', color: LoopyColors.charcoal, marginBottom: 8 },
  roleBadge: { backgroundColor: LoopyColors.lightGrey, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100 },
  roleText: { fontSize: 11, fontWeight: '800', color: LoopyColors.grey, letterSpacing: 1 },
  statsContainer: { flexDirection: 'row', backgroundColor: LoopyColors.white, marginHorizontal: 24, borderRadius: 24, paddingVertical: 20, borderWidth: 1, borderColor: LoopyColors.lightGrey, marginBottom: 32 },
  statCard: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal },
  statLabel: { fontSize: 11, fontWeight: '600', color: LoopyColors.grey, marginTop: 4 },
  menuSection: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: LoopyColors.grey, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  menuGroup: { backgroundColor: LoopyColors.white, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: LoopyColors.lightGrey },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 4 },
  menuIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { fontSize: 15, fontWeight: '700', color: LoopyColors.charcoal },
  menuSubText: { fontSize: 12, color: LoopyColors.grey, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, padding: 18, borderRadius: 20, backgroundColor: '#fef2f2', gap: 10, marginTop: 12 },
  logoutText: { color: LoopyColors.red, fontSize: 16, fontWeight: '800' },
  footerText: { textAlign: 'center', fontSize: 11, color: LoopyColors.grey, marginTop: 40, fontWeight: '600' },
});
