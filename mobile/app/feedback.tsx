import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoopyColors, Colors } from '../constants/colors';

export default function FeedbackScreen() {
  const navigation = useNavigation<any>();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (!feedback) {
      Alert.alert('Error', 'Please enter your feedback.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Thank You!', 'Your feedback has been submitted successfully.');
      navigation.goBack();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Give Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.heroTitle}>Your opinion matters!</Text>
          <Text style={styles.heroSub}>Help us improve Loopy by sharing your thoughts and experience.</Text>

          <View style={styles.ratingSection}>
            <Text style={styles.label}>Rate your experience</Text>
            <View style={styles.stars}>
               {[1, 2, 3, 4, 5].map((star) => (
                 <TouchableOpacity key={star} onPress={() => setRating(star)}>
                   <Ionicons 
                     name={star <= rating ? "star" : "star-outline"} 
                     size={32} 
                     color={star <= rating ? LoopyColors.yellow : LoopyColors.grey} 
                   />
                 </TouchableOpacity>
               ))}
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Detailed Feedback</Text>
            <TextInput
              style={styles.input}
              placeholder="Tell us what you like or what we can improve..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Feedback</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  heroTitle: { fontSize: 22, fontWeight: '800', color: LoopyColors.charcoal, textAlign: 'center', marginTop: 10 },
  heroSub: { fontSize: 14, color: LoopyColors.grey, textAlign: 'center', marginTop: 8, lineHeight: 22, marginBottom: 40 },
  ratingSection: { alignItems: 'center', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '700', color: LoopyColors.charcoal, marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 12 },
  inputSection: { marginBottom: 32 },
  input: {
    backgroundColor: LoopyColors.lightGrey,
    borderRadius: 20,
    padding: 20,
    fontSize: 15,
    color: LoopyColors.charcoal,
    minHeight: 150,
  },
  submitBtn: { backgroundColor: LoopyColors.green, padding: 18, borderRadius: 20, alignItems: 'center' },
  submitText: { color: LoopyColors.white, fontSize: 16, fontWeight: '800' },
});
