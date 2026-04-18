import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { api } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LoopyColors, Colors } from '../constants/colors';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('USER'); // Always USER — agents are created only by admin
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Account created! Please log in.', [
          { text: 'OK', onPress: () => router.push('/login') }
        ]);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.headerSection}>
         <View style={styles.logoContainer}>
            <Image 
               source={require('../assets/images/icon.png')} 
               style={styles.logo} 
               resizeMode="contain"
            />
         </View>
         <Text style={styles.brandName}>Loopy</Text>
         <Text style={styles.tagline}>Recycle. Reduce. Reuse.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.formSection}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up as a customer to start recycling</Text>

        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={20} color={LoopyColors.grey} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color={LoopyColors.grey} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color={LoopyColors.grey} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={LoopyColors.green} />
          <Text style={styles.infoText}>Agents are onboarded only by the platform admin.</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
               <Text style={styles.buttonText}>Join Loopy</Text>
               <Ionicons name="sparkles" size={18} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: LoopyColors.charcoal,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 10,
    color: LoopyColors.green,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  formSection: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: LoopyColors.charcoal,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 32,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: LoopyColors.charcoal,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },

  button: {
    backgroundColor: LoopyColors.green,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: LoopyColors.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
  },
  footerLink: {
    color: LoopyColors.green,
    fontSize: 15,
    fontWeight: '700',
  },
});
