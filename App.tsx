import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/services/TrackPlayerService';
import { musicPlayer } from './src/services/MusicPlayer';
import Logger from './src/utils/Logger';
import { LogLevel } from './src/config/constants';
import { ErrorHandler } from './src/utils/ErrorHandler';

// Configure logger for the app
Logger.configure({
  enabled: __DEV__ ?? true,
  minLevel: LogLevel.DEBUG,
  includeTimestamp: true,
  includeStackTrace: false,
});

const logger = Logger.getInstance('App');

export default function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      logger.group('App Initialization');
      logger.info('Starting app initialization');
      logger.time('initialization');

      try {
        // Setup track player
        logger.info('Setting up track player');
        const isReady = await setupPlayer();

        if (!isReady) {
          throw new Error('Track player setup failed');
        }

        // Setup music player
        logger.info('Setting up music player');
        await musicPlayer.setup();

        logger.info('Initialization completed successfully');
        setIsPlayerReady(true);
      } catch (err) {
        logger.error('Initialization failed', err);
        ErrorHandler.handle(err, 'App.initialize');
        setError('Failed to initialize the app. Please restart.');
      } finally {
        logger.timeEnd('initialization');
        logger.groupEnd();
      }
    }

    initialize();

    // Cleanup on unmount
    return () => {
      logger.info('App unmounting, cleaning up');
      // Add any cleanup logic here
    };
  }, []);

  // Error state
  if (error) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <Text style={{ color: '#FF5252', fontSize: 18, marginBottom: 10 }}>
          ⚠️ Error
        </Text>
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  // Loading state
  if (!isPlayerReady) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={{ color: '#fff', marginTop: 20, textAlign: 'center' }}>
          Initializing Player...
        </Text>
        <Text style={{ color: '#999', marginTop: 10, fontSize: 12, textAlign: 'center' }}>
          Running in Hybrid Mode: Music will play in Expo Go, but lock-screen controls require a Development Build.
        </Text>
      </View>
    );
  }

  // Main app
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

