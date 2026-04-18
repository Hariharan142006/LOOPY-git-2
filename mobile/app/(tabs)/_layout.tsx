import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { CustomTabBar } from '../../components/CustomTabBar';
import { useTranslation } from '../../hooks/useTranslation';

export default function TabLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const isAgent = user?.role === 'AGENT';

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: t('home'),
        }}
      />
      <Tabs.Screen
        name="pickups"
        options={{
          title: t('pickups'),
          href: isAgent ? '/pickups' : null,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t('bookings'),
          href: isAgent ? null : '/bookings',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t('wallet'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
        }}
      />
    </Tabs>
  );
}

