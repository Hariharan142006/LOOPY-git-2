import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoopyColors } from '../constants/theme';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '../utils/api';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Password Modal State
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      setProfile(response.data);
    } catch (error) {
      console.error("Fetch profile error", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBiometrics = async (value: boolean) => {
    try {
      if (value) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (!hasHardware || !isEnrolled) {
          Alert.alert("Not Available", "Biometric authentication is not set up on this device.");
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable Biometrics',
        });

        if (!result.success) return;
      }

      await api.patch('/api/user/settings', { biometricsEnabled: value });
      setProfile({ ...profile, biometricsEnabled: value });
      Alert.alert("Success", `Biometrics ${value ? 'enabled' : 'disabled'} successfully.`);
    } catch (error) {
      Alert.alert("Error", "Failed to update biometric settings.");
    }
  };

  const validatePassword = () => {
    if (!passData.current || !passData.new || !passData.confirm) {
      Alert.alert("Error", "Please fill all password fields.");
      return false;
    }
    if (passData.new !== passData.confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return false;
    }
    if (passData.new.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setPassLoading(true);
    try {
      await api.post('/api/user/password', {
        currentPassword: passData.current,
        newPassword: passData.new
      });
      Alert.alert("Success", "Password changed successfully!");
      setPassModalVisible(false);
      setPassData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleAction = (title: string) => {
    Alert.alert(title, `This feature will be available in the next update.`);
  };

  const SettingItem = ({ icon, label, onPress, color = LoopyColors.charcoal, destructive = false, rightElement }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={!!rightElement}>
      <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={22} color={destructive ? LoopyColors.red : color} />
      </View>
      <Text style={[styles.itemText, destructive && { color: LoopyColors.red }]}>{label}</Text>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={LoopyColors.grey} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={LoopyColors.green} size="large" style={{ marginVertical: 40 }} />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Details</Text>
              <View style={styles.group}>
                <View style={styles.profileInfo}>
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileInitial}>{profile?.name?.[0]?.toUpperCase() || 'U'}</Text>
                  </View>
                  <View style={styles.profileTexts}>
                    <Text style={styles.profileName}>{profile?.name}</Text>
                    <Text style={styles.profileEmail}>{profile?.email}</Text>
                    <Text style={styles.profilePhone}>{profile?.phone || 'No phone added'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>
              <View style={styles.group}>
                <SettingItem 
                  icon="lock-closed-outline" 
                  label="Change Password" 
                  onPress={() => setPassModalVisible(true)} 
                />
                <SettingItem 
                  icon="finger-print-outline" 
                  label="Biometric Authentication" 
                  rightElement={
                    <Switch 
                      value={profile?.biometricsEnabled || false} 
                      onValueChange={toggleBiometrics}
                      trackColor={{ false: '#eee', true: LoopyColors.green }}
                    />
                  }
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.group}>
            <SettingItem 
              icon="download-outline" 
              label="Export My Data" 
              onPress={() => handleAction('Export Data')} 
            />
            <SettingItem 
              icon="trash-outline" 
              label="Delete Account" 
              destructive 
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure? This action is permanent and cannot be undone.',
                  [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }]
                );
              }} 
            />
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={passModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPassModalVisible(false)}>
                <Ionicons name="close" size={24} color={LoopyColors.charcoal} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="••••••••"
                value={passData.current}
                onChangeText={(text) => setPassData({...passData, current: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Min. 6 characters"
                value={passData.new}
                onChangeText={(text) => setPassData({...passData, new: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Confirm your new password"
                value={passData.confirm}
                onChangeText={(text) => setPassData({...passData, confirm: text})}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, passLoading && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={passLoading}
            >
              <Text style={styles.saveBtnText}>{passLoading ? 'Updating...' : 'Update Password'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: LoopyColors.grey, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  group: { backgroundColor: LoopyColors.white, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: LoopyColors.lightGrey },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  itemText: { flex: 1, fontSize: 16, fontWeight: '700', color: LoopyColors.charcoal },
  profileInfo: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  profileBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: LoopyColors.green + '20', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  profileInitial: { fontSize: 24, fontWeight: '800', color: LoopyColors.green },
  profileTexts: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal, marginBottom: 2 },
  profileEmail: { fontSize: 13, fontWeight: '600', color: LoopyColors.grey, marginBottom: 2 },
  profilePhone: { fontSize: 12, fontWeight: '600', color: LoopyColors.grey },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: LoopyColors.charcoal },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: LoopyColors.grey, marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  saveBtn: { backgroundColor: LoopyColors.charcoal, borderRadius: 20, padding: 20, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
