import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocking Expo modules to allow build to proceed after removal
export const useRouter = () => ({ 
  replace: () => {}, 
  push: () => {}, 
  back: () => {}, 
  setParams: () => {},
  canGoBack: () => false,
});
export const useSegments = () => [""];
export const useLocalSearchParams = () => ({});
export const useFocusEffect = (cb) => { React.useEffect(cb, []); };

export const Stack = ({ children }) => children;
export const Link = ({ children }) => children;
export const Tabs = ({ children }) => children;

export const getItemAsync = (key) => AsyncStorage.getItem(key);
export const setItemAsync = (key, value) => AsyncStorage.setItem(key, value);
export const deleteItemAsync = (key) => AsyncStorage.removeItem(key);

export const preventAutoHideAsync = async () => {};
export const hideAsync = async () => {};

export const useFonts = () => [true, null];
export const loadAsync = async () => {};

export const Poppins_400Regular = "Poppins_400Regular";
export const Poppins_500Medium = "Poppins_500Medium";
export const Poppins_600SemiBold = "Poppins_600SemiBold";
export const Poppins_700Bold = "Poppins_700Bold";

export const StatusBar = ({ style }) => null;

export const Haptics = { 
  selectionAsync: async () => {}, 
  notificationAsync: async () => {},
  impactAsync: async () => {},
  ImpactFeedbackStyle: { Light: 1, Medium: 2, Heavy: 3 }
};
// Location
export const requestForegroundPermissionsAsync = async () => ({ status: 'granted' });
export const getCurrentPositionAsync = async () => ({ coords: { latitude: 0, longitude: 0 } });
export const reverseGeocodeAsync = async () => [{ name: 'Placeholder Address', street: '123 Green St', city: 'Eco City' }];
export const watchPositionAsync = async () => ({ remove: () => {} });
export const Accuracy = { Balanced: 1, High: 2 };

// Camera
export const requestCameraPermissionsAsync = async () => ({ status: 'granted' });

// ImagePicker
export const launchImageLibraryAsync = async () => ({ canceled: true });
export const launchCameraAsync = async () => ({ canceled: true });
export const requestMediaLibraryPermissionsAsync = async () => ({ status: 'granted' });
export const MediaTypeOptions = { All: 'All', Images: 'Images', Videos: 'Videos' };

// Legacy objects for compatibility with some imports
export const Location = { 
  requestForegroundPermissionsAsync, 
  getCurrentPositionAsync, 
  reverseGeocodeAsync,
  watchPositionAsync,
  Accuracy
};
export const Camera = { requestCameraPermissionsAsync };
export const ImagePicker = {
  launchImageLibraryAsync,
  launchCameraAsync,
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  MediaTypeOptions
};

export const EventEmitter = class {
  addListener() { return { remove: () => {} }; }
  removeListeners() { }
  emit() { }
};

export const NativeModulesProxy = {
  EventEmitter: new EventEmitter(),
};
export const UnavailabilityError = class extends Error {};

import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIconsIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Ionicons = IoniconsIcon;
export const MaterialIcons = MaterialIconsIcon;
export const FontAwesome = FontAwesomeIcon;
export const Feather = FeatherIcon;
export const MaterialCommunityIcons = MaterialCommunityIconsIcon;

export default {
  useRouter,
  useSegments,
  useLocalSearchParams,
  useFocusEffect,
  Stack,
  Link,
  Tabs,
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  preventAutoHideAsync,
  hideAsync,
  useFonts,
  loadAsync,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  StatusBar,
  Haptics,
  Location,
  Camera,
  EventEmitter,
  NativeModulesProxy,
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  UnavailabilityError,
  ImagePicker
};
