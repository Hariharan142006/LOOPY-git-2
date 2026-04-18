import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoopyColors, Colors } from '../constants/colors';
import { api } from '../utils/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from '../hooks/useTranslation';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('options'); // 'options' or 'tickets'
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/support/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error("Fetch tickets error", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const response = await api.get(`/api/support/tickets/${ticketId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Fetch messages error", error);
    }
  };

  const createTicket = async () => {
    if (!newTicketSubject || !newTicketMessage) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/support/tickets', {
        subject: newTicketSubject,
        message: newTicketMessage
      });
      setTickets([response.data, ...tickets]);
      setIsCreatingTicket(false);
      setNewTicketSubject('');
      setNewTicketMessage('');
      Alert.alert("Success", "Support ticket created! We will get back to you soon.");
      setActiveTab('tickets');
    } catch (error) {
      Alert.alert("Error", "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      const response = await api.post(`/api/support/tickets/${selectedTicket.id}/messages`, {
        text: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      alert("Could not open link");
    });
  };

  const SupportOption = ({ icon, label, sub, onPress, color }: any) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={LoopyColors.grey} />
    </TouchableOpacity>
  );

  const renderTicketItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.ticketCard} 
      onPress={() => {
        setSelectedTicket(item);
        fetchMessages(item.id);
      }}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject}>{item.subject}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'OPEN' ? '#f0fdf4' : '#f3f4f6' }]}>
          <Text style={[styles.statusText, { color: item.status === 'OPEN' ? LoopyColors.green : LoopyColors.grey }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.ticketDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (selectedTicket) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedTicket(null)}>
            <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{selectedTicket.subject}</Text>
          </View>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          renderItem={({ item }) => (
            <View style={[styles.messageWrapper, item.isAdmin ? styles.adminMessage : styles.userMessage]}>
              <View style={[styles.messageBubble, item.isAdmin ? styles.adminBubble : styles.userBubble]}>
                <Text style={[styles.messageText, { color: item.isAdmin ? LoopyColors.charcoal : '#fff' }]}>{item.text}</Text>
              </View>
              <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder={t('type_message')}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={LoopyColors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('help_support_header')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'options' && styles.activeTab]} 
          onPress={() => setActiveTab('options')}
        >
          <Text style={[styles.tabText, activeTab === 'options' && styles.activeTabText]}>{t('options')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]} 
          onPress={() => setActiveTab('tickets')}
        >
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>{t('my_tickets')}</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'options' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.heroSection}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset-outline" size={40} color={LoopyColors.green} />
            </View>
            <Text style={styles.heroTitle}>{t('how_can_help')}</Text>
            <Text style={styles.heroSub}>{t('support_sub')}</Text>
          </View>

          <View style={styles.group}>
            <SupportOption 
              icon="chatbubble-ellipses-outline" 
              label={t('message_support')} 
              sub={t('chat_sub')} 
              color={LoopyColors.green}
              onPress={() => setIsCreatingTicket(true)}
            />
            <SupportOption 
              icon="logo-whatsapp" 
              label={t('chat_whatsapp')} 
              color="#25D366"
              onPress={() => openLink('https://wa.me/919999999999')}
            />
            <SupportOption 
              icon="mail-outline" 
              label={t('email_support')} 
              color={LoopyColors.blue}
              onPress={() => openLink('mailto:support@loopy.co')}
            />
          </View>

          <Text style={styles.sectionTitle}>{t('faq')}</Text>
          <View style={styles.group}>
            <TouchableOpacity style={styles.faqItem}>
               <Text style={styles.faqText}>How to track my pickup?</Text>
               <Ionicons name="add" size={20} color={LoopyColors.grey} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.faqItem}>
               <Text style={styles.faqText}>What items can I recycle?</Text>
               <Ionicons name="add" size={20} color={LoopyColors.grey} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.center}><ActivityIndicator color={LoopyColors.green} /></View>
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.ticketList}
              renderItem={renderTicketItem}
              ListEmptyComponent={
                <View style={[styles.center, { marginTop: 100 }]}>
                  <Ionicons name="chatbox-outline" size={64} color="#f3f4f6" />
                  <Text style={styles.emptyTitle}>{t('no_tickets')}</Text>
                  <Text style={styles.emptySub}>{t('ask_question_sub')}</Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* Create Ticket Modal Backdrop */}
      {isCreatingTicket && (
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('new_ticket')}</Text>
              <TouchableOpacity onPress={() => setIsCreatingTicket(false)}>
                <Ionicons name="close" size={24} color={LoopyColors.charcoal} />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.modalInput} 
              placeholder={t('subject_placeholder')} 
              value={newTicketSubject}
              onChangeText={setNewTicketSubject}
            />
            <TextInput 
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]} 
              placeholder={t('describe_issue')} 
              multiline
              value={newTicketMessage}
              onChangeText={setNewTicketMessage}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={createTicket}>
              <Text style={styles.submitBtnText}>{t('submit_request')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroSection: { alignItems: 'center', marginBottom: 32 },
  supportIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: LoopyColors.charcoal, marginBottom: 8 },
  heroSub: { fontSize: 14, color: LoopyColors.grey, textAlign: 'center', lineHeight: 22 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 12, gap: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f3f4f6' },
  activeTab: { backgroundColor: LoopyColors.green },
  tabText: { fontSize: 13, fontWeight: '700', color: LoopyColors.grey },
  activeTabText: { color: '#fff' },
  group: { backgroundColor: LoopyColors.white, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: LoopyColors.lightGrey, marginBottom: 32 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 4 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: LoopyColors.charcoal },
  optionSub: { fontSize: 12, color: LoopyColors.grey, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: LoopyColors.grey, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  faqItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: LoopyColors.lightGrey },
  faqText: { fontSize: 14, fontWeight: '600', color: LoopyColors.charcoal },
  
  ticketList: { padding: 24 },
  ticketCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: LoopyColors.lightGrey },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  ticketSubject: { fontSize: 16, fontWeight: '700', color: LoopyColors.charcoal, flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  ticketDate: { fontSize: 12, color: LoopyColors.grey },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: LoopyColors.charcoal, marginTop: 16 },
  emptySub: { fontSize: 14, color: LoopyColors.grey, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: LoopyColors.charcoal },
  modalInput: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, fontSize: 15, color: LoopyColors.charcoal, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  submitBtn: { backgroundColor: LoopyColors.green, borderRadius: 16, padding: 18, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  chatContainer: { padding: 20, paddingBottom: 100 },
  messageWrapper: { marginBottom: 16, maxWidth: '80%' },
  userMessage: { alignSelf: 'flex-end' },
  adminMessage: { alignSelf: 'flex-start' },
  messageBubble: { padding: 14, borderRadius: 20 },
  userBubble: { backgroundColor: LoopyColors.green, borderBottomRightRadius: 4 },
  adminBubble: { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  messageTime: { fontSize: 10, color: LoopyColors.grey, marginTop: 4, alignSelf: 'flex-end' },
  inputArea: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', alignItems: 'flex-end', gap: 12 },
  input: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: LoopyColors.green, alignItems: 'center', justifyContent: 'center' },
});
