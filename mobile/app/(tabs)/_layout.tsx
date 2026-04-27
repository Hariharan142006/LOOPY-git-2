import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../../components/CustomTabBar';
import { useTranslation } from '../../hooks/useTranslation';

// Import Screen Components
import HomeScreen from './index';
import PickupsScreen from './pickups';
import BookingsScreen from './bookings';
import WalletScreen from './wallet';
import ProfileScreen from './profile';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
      }}>
      <Tab.Screen
        name="index"
        component={HomeScreen}
        options={{
          title: t('home'),
        }}
      />
      <Tab.Screen
        name="pickups"
        component={PickupsScreen}
        options={{
          title: t('pickups'),
        }}
      />
      <Tab.Screen
        name="bookings"
        component={BookingsScreen}
        options={{
          title: t('bookings'),
        }}
      />
      <Tab.Screen
        name="wallet"
        component={WalletScreen}
        options={{
          title: t('wallet'),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: t('profile'),
        }}
      />
    </Tab.Navigator>
  );
}
