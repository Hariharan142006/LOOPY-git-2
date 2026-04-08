import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LoopyColors } from '../constants/theme';

const { width } = Dimensions.get('window');

const WEIGHT_RANGES = [
  { label: '0-5 Kgs', min: 0, max: 5, avg: 2.5 },
  { label: '5-10 Kgs', min: 5, max: 10, avg: 7.5 },
  { label: '10-15 Kgs', min: 10, max: 15, avg: 12.5 },
  { label: 'More than 15 Kgs', min: 15, max: 100, avg: 20 }
];

const TIME_SLOTS = [
  { label: '9:30 AM - 11:30 AM', value: '09:30' },
  { label: '11:30 AM - 1:30 PM', value: '11:30' },
  { label: '2:30 PM - 4:30 PM', value: '14:30' },
  { label: '4:30 PM - 7:00 PM', value: '16:30' }
];

const CAT_ICONS: any = {
  'Paper': 'document-text',
  'Plastic': 'flask',
  'Metal': 'construct',
  'E-Waste': 'hardware-chip',
  'Glass': 'beaker',
  'Clothes': 'shirt'
};

export default function BookPickupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Data
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Form State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [date, setDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].value);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [weightRange, setWeightRange] = useState(WEIGHT_RANGES[0]);
  const [remarks, setRemarks] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [catRes, addrRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/user/addresses')
      ]);
      setCategories(catRes.data.categories || []);
      setAddresses(addrRes.data.addresses || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to detect your address.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverse.length > 0) {
        const addr = reverse[0];
        setSelectedAddress({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          address: `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}`.replace(/^, /, ''),
          isNew: true
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not detect location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a pickup location.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/bookings', {
        items: selectedCategories.map(catId => {
           const cat = categories.find((c: any) => c.id === catId);
           const firstItem = (cat as any)?.items?.[0] || { id: 'unknown', currentPrice: 10 };
           return { id: firstItem.id, qty: weightRange.avg / selectedCategories.length, price: firstItem.currentPrice };
        }),
        schedule: {
          date: date.toISOString().split('T')[0],
          time: timeSlot
        },
        location: selectedAddress,
        totalAmount: 0,
        remarks
      });

      if (response.data.success) {
        Alert.alert('Success', 'Pickup scheduled successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)' as any) }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule pickup.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
     <View style={styles.indicatorContainer}>
        <View style={styles.indicatorTrack}>
           <Animated.View style={[styles.indicatorFill, { width: `${(step / 2) * 100}%` }]} />
        </View>
        <View style={styles.indicatorLabelBox}>
           <Text style={styles.indicatorText}>Step {step} of 2</Text>
           <Text style={styles.indicatorSub}>{step === 1 ? 'Material Selection' : 'Location & Time'}</Text>
        </View>
     </View>
  );

  const renderStep1 = () => (
    <Animated.View entering={FadeInUp} style={styles.stepContainer}>

      <Text style={styles.sectionTitle}>What are we collecting?</Text>
      <Text style={styles.sectionSub}>Select all categories that apply to your scrap.</Text>
      
      <View style={styles.grid}>
        {categories.map((cat: any) => {
          const isSelected = selectedCategories.includes(cat.id);
          const iconName = CAT_ICONS[cat.name] || 'cube-outline';
          return (
            <TouchableOpacity 
              key={cat.id} 
              activeOpacity={0.7}
              style={[styles.catCard, isSelected && styles.catCardSelected]}
              onPress={() => handleCategoryToggle(cat.id)}
            >
              <View style={[styles.iconCircle, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                 <Ionicons name={iconName} size={28} color={isSelected ? '#fff' : LoopyColors.green} />
              </View>
              <Text style={[styles.catName, isSelected && styles.catNameSelected]}>{cat.name}</Text>
              {isSelected && (
                 <Animated.View entering={FadeInDown} style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color={LoopyColors.green} />
                 </Animated.View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, selectedCategories.length === 0 && styles.buttonDisabled]}
        onPress={() => {
          if (selectedCategories.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one material to continue.');
          } else {
            setStep(2);
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Continue to Details</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>

    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInUp} style={styles.stepContainer}>

      <Text style={styles.sectionTitle}>Finalize Pickup</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Choose Date</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={LoopyColors.grey} />
          <Text style={styles.inputBoxText}>{date.toDateString()}</Text>
          <Ionicons name="chevron-down" size={16} color={LoopyColors.grey} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pickup Window</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TIME_SLOTS.map(slot => (
            <TouchableOpacity 
              key={slot.value} 
              style={[styles.chip, timeSlot === slot.value && styles.chipActive]}
              onPress={() => setTimeSlot(slot.value)}
            >
              <Text style={[styles.chipText, timeSlot === slot.value && styles.chipTextActive]}>{slot.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Estimated Weight</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {WEIGHT_RANGES.map(range => (
            <TouchableOpacity 
              key={range.label} 
              style={[styles.chip, weightRange.label === range.label && styles.chipActive]}
              onPress={() => setWeightRange(range)}
            >
              <Text style={[styles.chipText, weightRange.label === range.label && styles.chipTextActive]}>{range.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pickup Address</Text>
        {addresses.map((addr: any) => (
          <TouchableOpacity 
            key={addr.id} 
            style={[styles.addressCard, selectedAddress?.id === addr.id && styles.addressCardActive]}
            onPress={() => setSelectedAddress(addr)}
          >
            <View style={[styles.addressIcon, selectedAddress?.id === addr.id && { backgroundColor: LoopyColors.green }]}>
               <Ionicons name="home-outline" size={18} color={selectedAddress?.id === addr.id ? '#fff' : LoopyColors.grey} />
            </View>
            <View style={{ flex: 1 }}>
               <Text style={[styles.addressLabel, selectedAddress?.id === addr.id && { color: LoopyColors.green }]}>{addr.label}</Text>
               <Text style={styles.addressSub} numberOfLines={1}>{addr.street}</Text>
            </View>
            {selectedAddress?.id === addr.id && <Ionicons name="radio-button-on" size={20} color={LoopyColors.green} />}
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.detectBtn} onPress={handleDetectLocation} disabled={isLocating}>
          {isLocating ? <ActivityIndicator size="small" color={LoopyColors.green} /> : <Ionicons name="navigate-outline" size={18} color={LoopyColors.green} />}
          <Text style={styles.detectBtnText}>{selectedAddress?.isNew ? 'Location Detected ✓' : 'Detect Current Location'}</Text>
          {selectedAddress?.isNew && <Text style={styles.detectedAddr} numberOfLines={1}>{selectedAddress.address}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Special Instructions</Text>
        <TextInput 
          style={styles.textInput}
          placeholder="e.g. Call before arrival, Gate code..."
          placeholderTextColor={LoopyColors.grey}
          multiline
          value={remarks}
          onChangeText={setRemarks}
        />
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={20} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginTop: 0 }, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
             <>
                <Text style={styles.primaryButtonText}>Schedule Pickup</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
             </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 44 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LoopyColors.white },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  closeBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: LoopyColors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LoopyColors.lightGrey },
  headerTitle: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal },
  indicatorContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  indicatorTrack: { height: 6, backgroundColor: LoopyColors.lightGrey, borderRadius: 3, marginBottom: 12 },
  indicatorFill: { height: '100%', backgroundColor: LoopyColors.green, borderRadius: 3 },
  indicatorLabelBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  indicatorText: { fontSize: 12, fontWeight: '800', color: LoopyColors.green, textTransform: 'uppercase' },
  indicatorSub: { fontSize: 12, fontWeight: '600', color: LoopyColors.grey },
  stepContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: LoopyColors.charcoal, marginBottom: 6 },
  sectionSub: { fontSize: 14, color: LoopyColors.grey, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { width: (width - 52) / 2, backgroundColor: LoopyColors.white, borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: LoopyColors.lightGrey },
  catCardSelected: { backgroundColor: LoopyColors.green, borderColor: LoopyColors.green },
  iconCircle: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  catName: { fontSize: 14, fontWeight: '800', color: LoopyColors.charcoal },
  catNameSelected: { color: LoopyColors.white },
  checkBadge: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  primaryButton: { backgroundColor: LoopyColors.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, marginTop: 32, gap: 10, shadowColor: LoopyColors.green, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },

  primaryButtonText: { color: LoopyColors.white, fontSize: 16, fontWeight: '800' },
  buttonDisabled: { backgroundColor: '#d1d5db', shadowOpacity: 0 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '800', color: LoopyColors.charcoal, marginBottom: 10 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: LoopyColors.white, borderWidth: 1, borderColor: LoopyColors.lightGrey, borderRadius: 16, padding: 16, gap: 12 },
  inputBoxText: { fontSize: 15, color: LoopyColors.charcoal, fontWeight: '600' },
  chipRow: { gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: LoopyColors.lightGrey, backgroundColor: LoopyColors.white },
  chipActive: { backgroundColor: LoopyColors.green, borderColor: LoopyColors.green },
  chipText: { fontSize: 13, fontWeight: '700', color: LoopyColors.grey },
  chipTextActive: { color: LoopyColors.white },
  addressCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1.5, borderColor: LoopyColors.lightGrey, marginBottom: 12, gap: 12 },
  addressCardActive: { borderColor: LoopyColors.green, backgroundColor: '#f0fdf4' },
  addressIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: LoopyColors.lightGrey, alignItems: 'center', justifyContent: 'center' },
  addressLabel: { fontSize: 14, fontWeight: '800', color: LoopyColors.charcoal },
  addressSub: { fontSize: 12, color: LoopyColors.grey, marginTop: 2 },
  detectBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1.5, borderColor: LoopyColors.green, borderStyle: 'dashed', gap: 10, marginTop: 4 },
  detectBtnText: { color: LoopyColors.green, fontWeight: '800', fontSize: 14 },
  detectedAddr: { flex: 1, fontSize: 12, color: LoopyColors.grey, fontStyle: 'italic' },
  textInput: { backgroundColor: LoopyColors.white, borderWidth: 1, borderColor: LoopyColors.lightGrey, borderRadius: 16, padding: 16, fontSize: 15, color: LoopyColors.charcoal, height: 100, textAlignVertical: 'top' },
  footerRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  secondaryButton: { width: 60, height: 60, borderRadius: 20, borderWidth: 1.5, borderColor: LoopyColors.lightGrey, alignItems: 'center', justifyContent: 'center' },
});
