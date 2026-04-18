import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LoopyColors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isAgent = user?.role === 'AGENT';

  return (
    <View style={[styles.container, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key].options as any;
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          // Skip hidden tabs based on name and role
          if (route.name === 'explore') return null;
          if (route.name === 'pickups' && !isAgent) return null;
          if (route.name === 'bookings' && isAgent) return null;
          
          // Legacy check for expo-router hidden tabs
          if (options.href === null || options.tabBarButton === null || options.display === 'none') {
            return null;
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIcon = (name: string, focused: boolean) => {
            let iconName: any = 'home';
            switch (name) {
              case 'index': iconName = focused ? 'leaf' : 'leaf-outline'; break;
              case 'pickups': iconName = focused ? 'bicycle' : 'bicycle-outline'; break;
              case 'bookings': iconName = focused ? 'calendar' : 'calendar-outline'; break;
              case 'wallet': iconName = focused ? 'wallet' : 'wallet-outline'; break;
              case 'profile': iconName = focused ? 'person' : 'person-outline'; break;
            }
            return <Ionicons name={iconName} size={22} color={focused ? LoopyColors.success : LoopyColors.grey} />;
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused && styles.activeTabItem
              ]}
            >
              {getIcon(route.name, isFocused)}
              <Text style={[
                styles.label,
                { color: isFocused ? LoopyColors.success : LoopyColors.grey }
              ]}>
                {label.toString().toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 35,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 25,
    marginHorizontal: 2,
  },
  activeTabItem: {
    backgroundColor: '#dcfce7', // Light green background for active tab
  },
  label: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
