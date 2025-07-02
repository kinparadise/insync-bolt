import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme } = require('@/contexts/ThemeContext').useTheme();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.gradientStart }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false 
          }} 
        />
        <Stack.Screen 
          name="call/[id]" 
          options={{ 
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="join/[id]" 
          options={{ 
            presentation: 'modal',
            headerShown: false
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}