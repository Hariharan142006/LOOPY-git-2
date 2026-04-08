import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoopyColors } from '../constants/theme';
import { api } from '../utils/api';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
];

export default function LanguageNotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({
    appNotificationsEnabled: true,
    preferredLanguage: 'en'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/user/settings');
      setSettings(response.data);
    } catch (error) {
      console.error("Fetch settings error", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await api.patch('/api/user/settings', { [key]: value });
    } catch (error) {
      Alert.alert("Error", "Failed to update setting.");
      fetchSettings(); // Revert on failure
    }
  };

  const SettingRow = ({ icon, label, description, rightElement }: any) => (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: LoopyColors.charcoal + '10' }]}>
        <Ionicons name={icon} size={22} color={LoopyColors.charcoal} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description && <Text style={styles.rowDesc}>{description}</Text>}
      </View>
      {rightElement}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language & Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={LoopyColors.green} size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.group}>
                <SettingRow 
                  icon="notifications-outline"
                  label="App Notifications"
                  description="Receive alerts about your pickups and wallet"
                  rightElement={
                    <Switch 
                      value={settings.appNotificationsEnabled}
                      onValueChange={(val) => updateSetting('appNotificationsEnabled', val)}
                      trackColor={{ false: '#eee', true: LoopyColors.green }}
                    />
                  }
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferred Language</Text>
              <View style={styles.group}>
                {LANGUAGES.map((lang, index) => (
                  <TouchableOpacity 
                    key={lang.code}
                    style={[
                      styles.langItem,
                      index < LANGUAGES.length - 1 && styles.borderBottom
                    ]}
                    onPress={() => updateSetting('preferredLanguage', lang.code)}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <Text style={styles.langName}>{lang.name}</Text>
                    {settings.preferredLanguage === lang.code && (
                      <Ionicons name="checkmark-circle" size={22} color={LoopyColors.green} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal },
  scroll: { padding: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: LoopyColors.grey, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  group: { backgroundColor: '#fff', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#f3f4f6' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: LoopyColors.charcoal },
  rowDesc: { fontSize: 12, color: LoopyColors.grey, marginTop: 2 },
  langItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  langFlag: { fontSize: 20, marginRight: 16 },
  langName: { flex: 1, fontSize: 16, fontWeight: '700', color: LoopyColors.charcoal },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' }
});
