import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/user/bookings');
      setHistory(response.data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {history.map((item: any) => (
          <TouchableOpacity key={item.id} style={styles.record}>
             <View style={styles.recordLeft}>
                <View style={styles.iconCircle}>
                   <Ionicons name="calendar-clear" size={20} color="#10b981" />
                </View>
                <View>
                   <Text style={styles.recordTitle}>Pickup #{item.id.slice(-6).toUpperCase()}</Text>
                   <Text style={styles.recordDate}>{new Date(item.scheduledAt).toLocaleDateString()}</Text>
                </View>
             </View>
             <View style={styles.recordRight}>
                <Text style={styles.recordAmount}>₹{item.totalAmount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                   <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
             </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED': return '#10b981';
    case 'CANCELLED': return '#ef4444';
    case 'PENDING': return '#f59e0b';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scroll: {
    padding: 20,
  },
  record: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: '#ecfdf5',
     alignItems: 'center',
     justifyContent: 'center',
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  recordDate: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  recordRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});
