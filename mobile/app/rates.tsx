import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LoopyColors } from '../constants/theme';

const { width } = Dimensions.get('window');

const CAT_ICONS: any = {
  'Paper': { icon: 'document-text', color: '#3b82f6' },
  'Plastic': { icon: 'flask', color: '#8b5cf6' },
  'Metal': { icon: 'construct', color: '#f59e0b' },
  'E-Waste': { icon: 'hardware-chip', color: '#ef4444' },
  'Glass': { icon: 'beaker', color: '#10b981' },
  'Clothes': { icon: 'shirt', color: '#ec4899' },
  'Other': { icon: 'cube', color: '#6b7280' }
};

export default function RatesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/categories');
      const cats = response.data.categories || [];
      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0]);
    } catch (error) {
      console.error("Rates fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={LoopyColors.green} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Market Rates</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchRates}>
          {loading ? <ActivityIndicator size="small" color={LoopyColors.green} /> : <Ionicons name="refresh" size={22} color={LoopyColors.green} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={LoopyColors.grey} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search scrap items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={LoopyColors.grey}
        />
      </View>

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {categories.map((cat: any) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.tab, 
                activeCategory?.id === cat.id && styles.tabActive,
                activeCategory?.id === cat.id && { backgroundColor: CAT_ICONS[cat.name]?.color || LoopyColors.green, borderColor: CAT_ICONS[cat.name]?.color || LoopyColors.green }
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory?.id === cat.id && styles.tabTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Item Display */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp} style={styles.grid}>
          {activeCategory?.items?.filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any, index: number) => (
             <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)} style={styles.rateCard}>
                <View style={[styles.iconBox, { backgroundColor: (CAT_ICONS[activeCategory.name]?.color || LoopyColors.green) + '15' }]}>
                   <Ionicons 
                      name={CAT_ICONS[activeCategory.name]?.icon || 'cube-outline'} 
                      size={28} 
                      color={CAT_ICONS[activeCategory.name]?.color || LoopyColors.green} 
                   />
                </View>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.priceRow}>
                   <Text style={styles.priceVal}>₹{Number(item.currentPrice).toFixed(2)}</Text>
                   <Text style={styles.unitText}>/{item.unit}</Text>
                </View>
                <View style={styles.trendRow}>
                   <View style={[styles.trendBadge, { backgroundColor: item.currentPrice >= item.basePrice ? '#f0fdf4' : '#fef2f2' }]}>
                      <Ionicons 
                        name={item.currentPrice >= item.basePrice ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={item.currentPrice >= item.basePrice ? LoopyColors.green : LoopyColors.red} 
                      />
                      <Text style={[styles.trendLabel, { color: item.currentPrice >= item.basePrice ? LoopyColors.green : LoopyColors.red }]}>
                         {item.currentPrice >= item.basePrice ? 'STABLE' : 'DROPPED'}
                      </Text>
                   </View>
                </View>
             </Animated.View>
          ))}
        </Animated.View>

        {/* Informational Footer */}
        <View style={[styles.infoBox, { backgroundColor: '#f9fafb', borderColor: '#f3f4f6', borderWidth: 1 }]}>
           <View style={styles.infoIconBox}>
              <Ionicons name="information-circle" size={22} color={LoopyColors.green} />
           </View>
           <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Transparency Notice</Text>
              <Text style={styles.infoText}>
                These are real-time market estimates. Final price is determined by precise weighing during collection.
              </Text>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LoopyColors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: LoopyColors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LoopyColors.lightGrey },
  headerTitle: { fontSize: 20, fontWeight: '800', color: LoopyColors.charcoal },
  refreshBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabContainer: { paddingVertical: 12, marginBottom: 8 },
  tabs: { paddingHorizontal: 24, gap: 10 },
  tab: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, backgroundColor: LoopyColors.white, borderWidth: 1.5, borderColor: LoopyColors.lightGrey },
  tabActive: { backgroundColor: LoopyColors.green, borderColor: LoopyColors.green },
  tabText: { fontSize: 13, fontWeight: '700', color: LoopyColors.grey },
  tabTextActive: { color: LoopyColors.white },
  scroll: { padding: 24, paddingBottom: 60 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', marginHorizontal: 24, paddingHorizontal: 16, borderRadius: 16, height: 50, marginBottom: 8, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: LoopyColors.charcoal, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  rateCard: { width: (width - 62) / 2, backgroundColor: LoopyColors.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: LoopyColors.lightGrey, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  iconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  itemName: { fontSize: 13, fontWeight: '800', color: LoopyColors.charcoal, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  priceVal: { fontSize: 24, fontWeight: '900', color: LoopyColors.green },
  unitText: { fontSize: 11, fontWeight: '600', color: LoopyColors.grey, marginLeft: 2 },
  trendRow: { flexDirection: 'row' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  trendLabel: { fontSize: 9, fontWeight: '800' },
  infoBox: { flexDirection: 'row', backgroundColor: '#eff6ff', padding: 20, borderRadius: 24, marginTop: 32, gap: 16, alignItems: 'center' },
  infoIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#1e40af', marginBottom: 2 },
  infoText: { fontSize: 11, color: '#1e40af', lineHeight: 16, opacity: 0.8 },
});
