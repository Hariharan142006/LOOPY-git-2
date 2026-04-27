const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (
            name.startsWith('expo-') || 
            name === 'expo-router' || 
            name.startsWith('@expo/') ||
            name === 'expo'
          ) {
            return path.resolve(__dirname, 'stubs', 'expo-modules.js');
          }
          // Only redirect to node_modules if it's a package name, not a relative path
          if (!name.startsWith('.') && !path.isAbsolute(name)) {
            return path.resolve(__dirname, 'node_modules', name);
          }
          return name;
        },
      }
    ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
