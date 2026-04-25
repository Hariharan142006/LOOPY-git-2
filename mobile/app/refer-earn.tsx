import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Share, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoopyColors, Colors } from '../constants/colors';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { api } from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';

export default function ReferEarnScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user/referrals');
      setReferrals(response.data);
    } catch (error) {
      console.error("Fetch referrals error", error);
    } finally {
      setLoading(false);
    }
  };

  const onShare = async (code: string, reward: number) => {
    try {
      await Share.share({
        message: t('invite_message' as any, { code, reward }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = (code: string) => {
    // Clipboard.setString(code);
    Alert.alert(t('copied'), t('code_copied'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('refer_earn_header')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInUp} style={styles.heroCard}>
          <View style={styles.rewardIcon}>
            <Ionicons name="gift" size={50} color={LoopyColors.white} />
          </View>
          <Text style={styles.heroTitle}>{t('invite_friends_title')}</Text>
          <Text style={styles.heroSub}>{t('invite_friends_sub')}</Text>
        </Animated.View>

        {loading ? (
          <ActivityIndicator color={LoopyColors.green} size="large" style={{ marginTop: 40 }} />
        ) : referrals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={64} color="#f3f4f6" />
            <Text style={styles.emptyTitle}>{t('no_active_promotions')}</Text>
            <Text style={styles.emptySub}>{t('check_back_later')}</Text>
          </View>
        ) : (
          referrals.map((reward, idx) => (
            <Animated.View key={reward.id} entering={FadeInDown.delay(idx * 100)} style={styles.rewardCard}>
              <View style={styles.codeSection}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{t('promotional_reward')}</Text>
                  <View style={styles.rewardPill}>
                    <Text style={styles.rewardPillText}>₹{reward.rewardAmount}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.codeBox} onPress={() => copyToClipboard(reward.referralCode)}>
                  <Text style={styles.codeText}>{reward.referralCode}</Text>
                  <Ionicons name="copy-outline" size={20} color={LoopyColors.green} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.shareBtn} onPress={() => onShare(reward.referralCode, reward.rewardAmount)}>
                <Ionicons name="share-social-outline" size={20} color={LoopyColors.white} />
                <Text style={styles.shareText}>{t('share_invite_link')}</Text>
              </TouchableOpacity>
              
              {reward.description && (
                <View style={styles.descBox}>
                  <Ionicons name="information-circle-outline" size={14} color={LoopyColors.grey} />
                  <Text style={styles.descText}>{reward.description}</Text>
                </View>
              )}
            </Animated.View>
          ))
        )}

        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>{t('how_it_works')}</Text>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepText}>{t('step1_desc')}</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepText}>{t('step2_desc')}</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.stepText}>{t('step3_desc')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LoopyColors.white },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: LoopyColors.lightGrey,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LoopyColors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: LoopyColors.charcoal },
  scroll: { padding: 24 },
  heroCard: { backgroundColor: LoopyColors.green, borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 32 },
  rewardIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: LoopyColors.white, textAlign: 'center', marginBottom: 12 },
  heroSub: { fontSize: 14, color: LoopyColors.white, textAlign: 'center', opacity: 0.9, lineHeight: 20 },
  codeSection: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginLeft: 4 },
  label: { fontSize: 11, fontWeight: '800', color: LoopyColors.grey, textTransform: 'uppercase', letterSpacing: 1.5 },
  rewardPill: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rewardPillText: { color: LoopyColors.green, fontSize: 12, fontWeight: '800' },
  codeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#eee', borderStyle: 'dashed' },
  codeText: { fontSize: 20, fontWeight: '900', color: LoopyColors.charcoal, letterSpacing: 2 },
  shareBtn: { backgroundColor: LoopyColors.charcoal, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 10, marginBottom: 16 },
  shareText: { color: LoopyColors.white, fontSize: 16, fontWeight: '800' },
  rewardCard: { backgroundColor: '#fff', borderRadius: 28, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  descBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  descText: { fontSize: 11, color: LoopyColors.grey, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal, marginTop: 16 },
  emptySub: { fontSize: 14, color: LoopyColors.grey, marginTop: 8, textAlign: 'center' },
  howItWorks: { gap: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: LoopyColors.charcoal, marginBottom: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: LoopyColors.lightGrey, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 14, fontWeight: '800', color: LoopyColors.green },
  stepText: { fontSize: 14, fontWeight: '600', color: LoopyColors.grey, flex: 1 },
});
