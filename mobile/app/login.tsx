import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LoopyColors, Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      if (token && user) {
        await login(token, user);
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      const message = error.response?.data?.error || 'Failed to connect to server';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.headerSection}>
         <View style={styles.logoContainer}>
            <Image 
               source={require('../assets/images/finial_logo.jpg')} 
               style={styles.logo} 
               resizeMode="contain"
            />
         </View>
         <Text style={styles.brandName}>Loopy</Text>
         <Text style={styles.tagline}>Recycle. Reduce. Reuse.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.formSection}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your green future</Text>

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
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
             <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={LoopyColors.grey} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPass}>
           <Text style={styles.forgotPassText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
               <Text style={styles.buttonText}>Sign In</Text>
               <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New customer? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    // Removed background and border for a cleaner floating logo look
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 90,
    height: 90,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: LoopyColors.charcoal,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: LoopyColors.green,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
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
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPassText: {
    color: LoopyColors.green,
    fontSize: 14,
    fontWeight: '600',
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
  agentNote: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  agentNoteText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
