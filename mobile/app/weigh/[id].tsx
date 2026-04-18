import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import { LoopyColors, Colors } from '../../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WeighingScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const categoryIcons: any = {
        'Paper': 'newspaper-outline',
        'Plastic': 'cube-outline',
        'Metal': 'construct-outline',
        'E-Waste': 'hardware-chip-outline',
        'Glass': 'beaker-outline',
        'Iron': 'hammer-outline',
        'Carton': 'archive-outline',
        'Copper': 'magnet-outline'
    };


    const [booking, setBooking] = useState<any>(null);
    const [scrapItems, setScrapItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>([]); // { itemId, weight, price }
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        const load = async () => {
             const bookingId = Array.isArray(id) ? id[0] : id;
             try {
                const [bRes, catsRes] = await Promise.all([
                    api.get(`/api/bookings/${bookingId}`),
                    api.get('/api/categories')
                ]);
                setBooking(bRes.data);
                
                // Extract all items from all categories
                const allItems = (catsRes.data.categories || []).flatMap((c: any) => c.items || []);
                setScrapItems(allItems);

                console.log(`[WEIGH] Loaded ${allItems.length} items for booking ${bookingId}`);
             } catch (e: any) {
                console.error('Weighing Load Error:', e.response?.status, e.response?.data);
                const msg = e.response?.data?.error || 'Connection Error';
                Alert.alert('Load Failure', `Failed to load data: ${msg}`);
             } finally {
                setLoading(false);
             }
        };
        load();
    }, [id]);

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { itemId: scrapItems[0].id, weight: '', price: scrapItems[0].currentPrice }]);
    };

    const updateItem = (index: number, key: string, value: any) => {
        const newItems = [...selectedItems];
        if (key === 'itemId') {
            const item = scrapItems.find(i => i.id === value);
            newItems[index] = { ...newItems[index], itemId: value, price: item.currentPrice };
        } else {
            newItems[index][key] = value;
        }
        setSelectedItems(newItems);
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.5,
        });
        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const totalToPay = selectedItems.reduce((acc, curr) => acc + (parseFloat(curr.weight || 0) * curr.price), 0);

    const handleBarCodeScanned = ({ data }: any) => {
        setShowScanner(false);
        processPayment(data);
    };

    const processPayment = async (customerWalletId: string = 'DIRECT') => {
        if (selectedItems.length === 0) {
            Alert.alert('No Items', 'Please add at least one scrap item before paying.');
            return;
        }
        const hasEmptyWeight = selectedItems.some(i => !i.weight || parseFloat(i.weight) <= 0);
        if (hasEmptyWeight) {
            Alert.alert('Missing Weight', 'Please enter a valid weight for all items.');
            return;
        }
        if (totalToPay <= 0) {
            Alert.alert('Invalid Amount', 'Total amount must be greater than zero.');
            return;
        }
        try {
            setLoading(true);
            await api.post(`/api/bookings/${id}/pay`, {
                items: selectedItems,
                photos,
                totalAmount: totalToPay,
                customerWalletId
            });
            setPaymentSuccess(true);
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 3000);
        } catch (e: any) {
            const errMsg = e.response?.data?.error || 'Could not process payment. Please try again.';
            Alert.alert('Payment Failed', errMsg);
        } finally {
            setLoading(false);
        }
    };


    if (paymentSuccess) {

        return (
            <View style={styles.successContainer}>
                <Animated.View entering={FadeIn} style={styles.successCircle}>
                    <Ionicons name="checkmark" size={60} color="#fff" />
                </Animated.View>
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successSub}>Customer has received ₹{totalToPay.toFixed(2)} in their wallet.</Text>
            </View>
        );
    }

    const openScanner = async () => {
        if (!permission?.granted) {
            const res = await requestPermission();
            if (!res.granted) return;
        }
        setShowScanner(true);
    };

    if (showScanner) {
        return (
            <View style={styles.scannerContainer}>
                <CameraView
                  onBarcodeScanned={handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  style={StyleSheet.absoluteFillObject}
                />
                <TouchableOpacity style={styles.closeScanner} onPress={() => setShowScanner(false)}>
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Weighing & Payment</Text>
            </View>

            <View style={styles.bookingBrief}>
                <Text style={styles.briefLabel}>PICKUP FOR</Text>
                <Text style={styles.briefName}>{booking?.user?.name}</Text>
                <Text style={styles.briefAddress}>{booking?.address?.street}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Scrap Items</Text>
                    <TouchableOpacity onPress={handleAddItem} style={styles.addBtn}>
                        <Ionicons name="add" size={20} color={LoopyColors.green} />
                        <Text style={styles.addBtnText}>Add Item</Text>
                    </TouchableOpacity>
                </View>

                {selectedItems.map((item, index) => (
                    <Animated.View entering={FadeInDown.delay(index * 100)} key={index} style={styles.scrapRow}>
                        <View style={styles.itemSelect}>
                            <Text style={styles.label}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {scrapItems.map(si => (
                                    <TouchableOpacity 
                                        key={si.id} 
                                        style={[styles.catChip, item.itemId === si.id && styles.catChipActive]}
                                        onPress={() => updateItem(index, 'itemId', si.id)}
                                    >
                                        <Ionicons 
                                            name={categoryIcons[si.name] || 'layers-outline'} 
                                            size={16} 
                                            color={item.itemId === si.id ? '#fff' : LoopyColors.charcoal} 
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={[styles.catChipText, item.itemId === si.id && styles.catChipTextActive]}>{si.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Weight (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.0"
                                    keyboardType="numeric"
                                    value={item.weight}
                                    onChangeText={(v) => updateItem(index, 'weight', v)}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.label}>Rate</Text>
                                <Text style={styles.rateText}>₹{item.price.toFixed(2)} / kg</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Evidence Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                    {photos.map((p, i) => (
                        <Image key={i} source={{ uri: p }} style={styles.photoThumb} />
                    ))}
                    <TouchableOpacity style={styles.addPhotoBtn} onPress={takePhoto}>
                        <Ionicons name="camera" size={32} color={LoopyColors.grey} />
                        <Text style={styles.addPhotoText}>Take Proof</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalVal}>₹{totalToPay.toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.payBtn, totalToPay <= 0 && { opacity: 0.5 }]} 
                    onPress={() => processPayment('DIRECT')}
                    disabled={totalToPay <= 0 || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                            <Text style={styles.payBtnText}>Confirm Payment</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.qrBtn, totalToPay <= 0 && { opacity: 0.5 }]} 
                    onPress={() => totalToPay > 0 && openScanner()}
                    disabled={totalToPay <= 0 || loading}
                >
                    <Ionicons name="qr-code-outline" size={18} color={LoopyColors.charcoal} />
                    <Text style={styles.qrBtnText}>Verify via QR Instead</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, gap: 16, marginBottom: 24 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: LoopyColors.charcoal },
    bookingBrief: { paddingHorizontal: 24, marginBottom: 32 },
    briefLabel: { fontSize: 10, fontWeight: '800', color: LoopyColors.grey, letterSpacing: 1 },
    briefName: { fontSize: 24, fontWeight: '900', color: LoopyColors.charcoal, marginTop: 4 },
    briefAddress: { fontSize: 14, color: LoopyColors.grey, marginTop: 4 },
    section: { paddingHorizontal: 24, marginBottom: 32 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addBtnText: { fontSize: 14, fontWeight: '700', color: LoopyColors.green },
    scrapRow: { backgroundColor: '#f9fafb', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6' },
    itemSelect: { marginBottom: 16 },
    label: { fontSize: 11, fontWeight: '700', color: LoopyColors.grey, marginBottom: 8, textTransform: 'uppercase' },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 16, fontWeight: '700' },
    rateText: { fontSize: 16, fontWeight: '700', color: LoopyColors.charcoal, paddingTop: 8 },
    inputRow: { flexDirection: 'row', marginTop: 16 },
    catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#e5e7eb' },

    catChipActive: { backgroundColor: LoopyColors.green, borderColor: LoopyColors.green },
    catChipText: { fontSize: 13, fontWeight: '600', color: LoopyColors.charcoal },
    catChipTextActive: { color: '#fff' },
    photoList: { flexDirection: 'row' },
    photoThumb: { width: 100, height: 100, borderRadius: 16, marginRight: 12 },
    addPhotoBtn: { width: 100, height: 100, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
    addPhotoText: { fontSize: 10, fontWeight: '700', color: LoopyColors.grey, marginTop: 4 },
    footer: { paddingHorizontal: 24, paddingTop: 20 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: LoopyColors.grey },
    totalVal: { fontSize: 28, fontWeight: '900', color: LoopyColors.charcoal },
    payBtn: { flexDirection: 'row', backgroundColor: LoopyColors.green, borderRadius: 20, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 },
    payBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    qrBtn: { flexDirection: 'row', backgroundColor: LoopyColors.lightGrey, borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 10 },
    qrBtnText: { color: LoopyColors.charcoal, fontSize: 14, fontWeight: '700' },

    scannerContainer: { flex: 1, backgroundColor: '#000' },
    closeScanner: { position: 'absolute', top: 60, right: 24 },
    successContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 40 },
    successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: LoopyColors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: '900', color: LoopyColors.charcoal, marginBottom: 8 },
    successSub: { fontSize: 16, color: LoopyColors.grey, textAlign: 'center', lineHeight: 24 },
});
