import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/services/TrackPlayerService';
import { musicPlayer } from './src/services/MusicPlayer';
import { View, ActivityIndicator, Text } from 'react-native';

export default function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function initialize() {
      const isReady = await setupPlayer();
      await musicPlayer.setup();
      setIsPlayerReady(isReady);
    }
    initialize();
  }, []);

  if (!isPlayerReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
