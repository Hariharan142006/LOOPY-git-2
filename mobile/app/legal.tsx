import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoopyColors, Colors } from '../constants/colors';

export default function LegalScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: 'Loopy is committed to protecting your privacy. We collect information to provide better services to all our users. This policy explains how we treat your personal data and protect your privacy when you use our services. By using our services, you agree that Loopy can use such data in accordance with our privacy policies.'
        };
      case 'content':
        return {
          title: 'Content Policy',
          content: 'Our Content Policy defines the standards for what is allowed on the Loopy platform. We aim to foster a community that is safe and respectful for all users. Prohibited content includes illegal items, hazardous materials, and any content that violates intellectual property rights.'
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          content: 'These Terms & Conditions govern your use of the Loopy mobile application and services. By accessing or using our services, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.'
        };
      default:
        return {
          title: 'Legal Information',
          content: 'Welcome to Loopy. Please review our various policies and terms of service below.'
        };
    }
  };

  const { title, content } = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contentBox}>
          <Text style={styles.lastUpdated}>Last Updated: March 2026</Text>
          <Text style={styles.text}>{content}</Text>
          
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>This document outlines our commitment to standard practices and compliance with local laws. We strive to provide a transparent experience for all recycling stakeholders.</Text>

          <Text style={styles.sectionTitle}>2. Your Responsibilities</Text>
          <Text style={styles.text}>As a user of Loopy, you are responsible for ensuring the accuracy of the information provided and for maintaining the security of your account credentials.</Text>

          <Text style={styles.sectionTitle}>3. Service Changes</Text>
          <Text style={styles.text}>We reserve the right to modify or terminate our services at any time, for any reason, with or without notice.</Text>
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
  contentBox: { backgroundColor: LoopyColors.white },
  lastUpdated: { fontSize: 12, color: LoopyColors.grey, marginBottom: 24, fontStyle: 'italic' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: LoopyColors.charcoal, marginTop: 24, marginBottom: 12 },
  text: { fontSize: 14, color: LoopyColors.grey, lineHeight: 24 },
});
