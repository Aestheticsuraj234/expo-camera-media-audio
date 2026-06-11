import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

const lessonScreenOptions = { headerShown: false, animation: 'slide_from_right' as const };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={lessonScreenOptions} />
        <Stack.Screen name="audio" options={lessonScreenOptions} />
        <Stack.Screen name="media-library" options={lessonScreenOptions} />
        <Stack.Screen name="location" options={lessonScreenOptions} />
        <Stack.Screen name="network" options={lessonScreenOptions} />
        <Stack.Screen name="battery" options={lessonScreenOptions} />
        <Stack.Screen name="haptics" options={lessonScreenOptions} />
        <Stack.Screen name="document-picker" options={lessonScreenOptions} />
        <Stack.Screen name="contacts" options={lessonScreenOptions} />
      </Stack>
    </ThemeProvider>
  );
}
