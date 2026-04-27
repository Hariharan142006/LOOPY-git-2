import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';

export default function ManageAddressesScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // New Address Form
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user/addresses');
      setAddresses(response.data.addresses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = async () => {
    setIsLocating(true);
    try {
      let hasPermission = false;
      if (Platform.OS === 'ios') {
          const auth = await Geolocation.requestAuthorization('whenInUse');
          hasPermission = auth === 'granted';
      } else {
          const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const apiKey = "AIzaSyA-upRfXkloEWajYtkwN7V4sT7mOikfjbw";
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const addr = data.results[0];
                const components = addr.address_components;
                
                let streetName = "";
                let cityVal = "";
                let postalCode = "";

                components.forEach((c: any) => {
                    if (c.types.includes('route')) streetName = c.long_name;
                    if (c.types.includes('locality')) cityVal = c.long_name;
                    if (c.types.includes('postal_code')) postalCode = c.long_name;
                });

                setStreet(streetName || addr.formatted_address.split(',')[0]);
                setCity(cityVal);
                setZip(postalCode);
            }
          } catch (e) {
            console.log("Geocoding error", e);
          }
          setIsLocating(false);
        },
        (error) => {
          Alert.alert(t('error'), t('could_not_detect_location'));
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } catch (e) {
      Alert.alert(t('error'), t('could_not_detect_location'));
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    if (!street || !city || !zip) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }

    setLoading(true);
    try {
      // For simplicity, we hardcode lat/lng or detect them
      // In a real app, you'd use the detector results
      await api.post('/api/user/addresses/create', {
        label,
        street,
        city,
        state: 'Unknown',
        zip,
        lat: 0, 
        lng: 0
      });
      setIsAdding(false);
      setStreet('');
      setCity('');
      setZip('');
      fetchAddresses();
    } catch (e) {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/api/user/addresses/delete', { id });
            fetchAddresses();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addresses_header')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!isAdding ? (
          <>
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsAdding(true)}>
              <Ionicons name="add-circle" size={24} color="#10b981" />
              <Text style={styles.addBtnText}>{t('add_new_address')}</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
            ) : (
              addresses.map((addr: any) => (
                <View key={addr.id} style={styles.addrCard}>
                  <View style={styles.addrIconBox}>
                    <Ionicons name="location-sharp" size={22} color="#10b981" />
                  </View>
                  <View style={styles.addrInfo}>
                    <Text style={styles.addrLabel}>{addr.label}</Text>
                    <Text style={styles.addrDetail}>{addr.street}, {addr.city}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(addr.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
            
            {addresses.length === 0 && !loading && (
              <View style={styles.empty}>
                 <Ionicons name="map-outline" size={48} color="#f3f4f6" />
                 <Text style={styles.emptyText}>{t('no_saved_addresses')}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{t('add_new_address')}</Text>
            
            <View style={styles.inputGroup}>
               <Text style={styles.label}>{t('address_label' as any)}</Text>
               <View style={styles.labelsRow}>
                  {['Home', 'Office', 'Other'].map(l => (
                    <TouchableOpacity 
                      key={l}
                      style={[styles.labelChip, label === l && styles.labelChipActive]}
                      onPress={() => setLabel(l)}
                    >
                      <Text style={[styles.chipText, label === l && styles.chipTextActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>{t('street_building')}</Text>
               <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="123 Green St" />
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>{t('city')}</Text>
               <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Hyderabad" />
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>{t('zip_code')}</Text>
               <TextInput style={styles.input} value={zip} onChangeText={setZip} placeholder="500001" keyboardType="numeric" />
            </View>

            <TouchableOpacity style={styles.detectBtn} onPress={handleDetect} disabled={isLocating}>
               {isLocating ? <ActivityIndicator size="small" color="#10b981" /> : <Ionicons name="navigate-outline" size={18} color="#10b981" />}
               <Text style={styles.detectText}>{t('detect_location')}</Text>
            </TouchableOpacity>

            <View style={styles.row}>
               <TouchableOpacity style={styles.cancelLink} onPress={() => setIsAdding(false)}>
                  <Text style={styles.cancelText}>{t('cancel')}</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveText}>{t('save_address')}</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scroll: {
    padding: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1fae5',
    marginBottom: 24,
    gap: 12,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
    gap: 16,
  },
  addrIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrInfo: {
    flex: 1,
  },
  addrLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  addrDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#fff',
    gap: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  labelsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  labelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  labelChipActive: {
    backgroundColor: '#10b981',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f9fafb',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: '#111827',
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
  },
  detectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  cancelLink: {
    flex: 1,
    alignItems: 'center',
  },
  cancelText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#10b981',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
