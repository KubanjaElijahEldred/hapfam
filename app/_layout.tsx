import React from 'react';
import { Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { StoreProvider } from '../src/store';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });

  // Apply Inter as the default family where the runtime supports it.
  try {
    const T = Text as any;
    if (!T.defaultProps) T.defaultProps = {};
    T.defaultProps.style = [{ fontFamily: loaded ? 'Inter_400Regular' : undefined }];
  } catch { /* harmless on platforms that disallow this */ }

  return (
    <StoreProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
      </View>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F8F5EB' } });
