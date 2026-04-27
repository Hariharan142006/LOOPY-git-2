import { AppRegistry, NativeModules } from 'react-native';
import App from './app/_layout';
import { name as appName } from './app.json';

// The Expo stubs are now handled by Metro redirection in metro.config.js
// Direct assignment to NativeModules is not allowed in recent React Native versions and causes a crash.


AppRegistry.registerComponent(appName, () => App);
