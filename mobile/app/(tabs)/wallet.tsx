import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, Dimensions, StatusBar } from 'react-native';
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LoopyColors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function WalletScreen() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/api/user/wallet');
      setWallet(response.data);
    } catch (error) {
      console.log('Error fetching wallet', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const handleWithdraw = () => {
    if ((wallet?.balance || 0) < 100) {
      Alert.alert('Low Balance', 'Minimum withdrawal amount is ₹100.');
      return;
    }
    Alert.alert(
        'Confirm Withdrawal', 
        `₹${Number(wallet.balance).toFixed(2)} will be transferred to your linked UPI/Bank account.`,
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', onPress: () => Alert.alert('Success', 'Transfer initiated! Funds will arrive within 24 hours.') }
        ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={LoopyColors.green} />
      </View>
    );
  }

  const lifetimeEarnings = (wallet?.balance || 0) + (wallet?.transactions?.reduce((acc: any, t: any) => t.type === 'DEBIT' ? acc + t.amount : acc, 0) || 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
         <Text style={styles.headerTitle}>My Wallet</Text>
         <TouchableOpacity style={styles.helpBtn}>
            <Ionicons name="help-circle-outline" size={24} color={LoopyColors.charcoal} />
         </TouchableOpacity>
      </View>

      <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LoopyColors.green} />}
          contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.content}>
          {/* Main Balance Card - Dark Mode Aesthetic */}
          <Animated.View entering={FadeInUp} style={styles.balanceCard}>
             <View style={styles.cardHeader}>
                <View style={styles.brandBadge}>
                   <Ionicons name="leaf" size={14} color={LoopyColors.green} />
                   <Text style={styles.brandBadgeText}>LOOPY PAY</Text>
                </View>
                <Ionicons name="wifi" size={20} color="#ffffff30" />
             </View>

             <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
             <Text style={styles.balanceVal}>₹{Number(wallet?.balance || 0).toFixed(2)}</Text>
             
             <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
                   <Text style={styles.withdrawText}>Withdraw Now</Text>
                   <Ionicons name="arrow-forward" size={16} color={LoopyColors.charcoal} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.qrToggle} onPress={() => setQrVisible(!qrVisible)}>
                   <Ionicons name="qr-code" size={24} color={LoopyColors.white} />
                </TouchableOpacity>
             </View>
          </Animated.View>

          {/* QR Section - Interactive */}
          {qrVisible && (
              <Animated.View entering={FadeInDown} style={styles.qrContainer}>
                  <View style={styles.qrHeader}>
                     <Text style={styles.qrTitle}>Personal Payment QR</Text>
                     <TouchableOpacity onPress={() => setQrVisible(false)}>
                        <Ionicons name="close-circle" size={24} color={LoopyColors.grey} />
                     </TouchableOpacity>
                  </View>
                  <Text style={styles.qrSubtitle}>Agent will scan this to credit your wallet instantly</Text>
                  <View style={styles.qrWrapper}>
                      <QRCode
                          value={JSON.stringify({ userId: user?.id, type: 'PAYMENT_RECEIVE', name: user?.name })}
                          size={180}
                          color={LoopyColors.charcoal}
                          backgroundColor="white"
                      />
                  </View>
                  <View style={styles.qrFooter}>
                     <Ionicons name="shield-checkmark" size={14} color={LoopyColors.green} />
                     <Text style={styles.qrSecureText}>Loopy Secure ID: {user?.id?.slice(-8).toUpperCase()}</Text>
                  </View>
              </Animated.View>
          )}

          {/* Detailed Stats */}
          <View style={styles.statsRow}>
              <Animated.View entering={FadeInUp.delay(200)} style={styles.statBox}>
                  <View style={[styles.statIconBox, { backgroundColor: '#f0fdf4' }]}>
                     <Ionicons name="leaf" size={20} color={LoopyColors.green} />
                  </View>
                  <View>
                     <Text style={styles.statVal}>{wallet?.impact?.kgRecycled || 0} KG</Text>
                     <Text style={styles.statLabel}>Total Recycled</Text>
                  </View>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(300)} style={styles.statBox}>
                  <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
                     <Ionicons name="cash-outline" size={20} color="#3b82f6" />
                  </View>
                  <View>
                     <Text style={styles.statVal}>₹{Number(lifetimeEarnings).toFixed(2)}</Text>
                     <Text style={styles.statLabel}>Lifetime Earning</Text>
                  </View>
              </Animated.View>
          </View>

          {/* Transactions List */}
          <View style={styles.historySection}>
              <View style={styles.sectionHeaderRow}>
                 <Text style={styles.sectionHeader}>History</Text>
                 <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
              </View>

              {(!wallet?.transactions || wallet.transactions.length === 0) ? (
                  <View style={styles.emptyCard}>
                      <Ionicons name="receipt-outline" size={40} color={LoopyColors.lightGrey} />
                      <Text style={styles.emptyText}>No activity recorded yet.</Text>
                  </View>
              ) : (
                  wallet.transactions.map((t: any, idx: number) => (
                      <Animated.View key={t.id} entering={SlideInRight.delay(idx * 100)} style={styles.transactionCard}>
                          <View style={[styles.itemIcon, { backgroundColor: t.type === 'CREDIT' ? '#f0fdf4' : '#fef2f2' }]}>
                              <Ionicons 
                                  name={t.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} 
                                  size={18} 
                                  color={t.type === 'CREDIT' ? LoopyColors.green : LoopyColors.red} 
                              />
                          </View>
                          <View style={styles.itemInfo}>
                              <Text style={styles.itemTitle}>{t.description || (t.type === 'CREDIT' ? 'Pickup Credit' : 'Balance Withdrawal')}</Text>
                              <Text style={styles.itemDate}>{new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</Text>
                          </View>
                          <Text style={[styles.itemAmount, { color: t.type === 'CREDIT' ? '#059669' : LoopyColors.red }]}>
                               {t.type === 'CREDIT' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
                          </Text>
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
  container: { flex: 1, backgroundColor: LoopyColors.white },
  header: { paddingTop: 60, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: LoopyColors.charcoal },
  helpBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: LoopyColors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LoopyColors.lightGrey },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingTop: 10 },
  balanceCard: { backgroundColor: LoopyColors.charcoal, borderRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  brandBadgeText: { color: LoopyColors.white, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  balanceLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  balanceVal: { color: LoopyColors.white, fontSize: 44, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 },
  withdrawBtn: { backgroundColor: LoopyColors.green, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  withdrawText: { color: LoopyColors.charcoal, fontWeight: '800', fontSize: 14 },
  qrToggle: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  qrContainer: { marginTop: 24, backgroundColor: '#f9fafb', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: LoopyColors.lightGrey, alignItems: 'center' },
  qrHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 16 },
  qrTitle: { fontSize: 16, fontWeight: '800', color: LoopyColors.charcoal },
  qrSubtitle: { fontSize: 13, color: LoopyColors.grey, textAlign: 'center', marginBottom: 24, lineHeight: 18 },
  qrWrapper: { backgroundColor: '#fff', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  qrFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 6 },
  qrSecureText: { fontSize: 11, fontWeight: '700', color: LoopyColors.grey, letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  statBox: { flex: 1, backgroundColor: LoopyColors.white, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: LoopyColors.lightGrey },
  statIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 16, fontWeight: '800', color: LoopyColors.charcoal },
  statLabel: { fontSize: 10, fontWeight: '600', color: LoopyColors.grey },
  historySection: { marginTop: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeader: { fontSize: 20, fontWeight: '800', color: LoopyColors.charcoal },
  viewAllText: { fontSize: 14, fontWeight: '700', color: LoopyColors.green },
  transactionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: LoopyColors.white, borderRadius: 20, borderWidth: 1, borderColor: LoopyColors.lightGrey, marginBottom: 12 },
  itemIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: LoopyColors.charcoal },
  itemDate: { fontSize: 11, color: LoopyColors.grey, marginTop: 2 },
  itemAmount: { fontSize: 16, fontWeight: '900', textAlign: 'right', minWidth: 80 },
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 24 },
  emptyText: { color: LoopyColors.grey, marginTop: 12, fontSize: 14, fontWeight: '500' },
});
