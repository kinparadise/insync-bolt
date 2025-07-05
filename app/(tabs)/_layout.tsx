import React from 'react';
import { Tabs, Stack } from 'expo-router';
import { Home, Calendar, Settings, Users, Grid } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ClassroomScreen from '../screens/classroom';
import BusinessScreen from '../screens/business';

export default function TabLayout() {
  const { theme } = useTheme();

  // Safety check for theme
  if (!theme) {
    return null; // Return null while theme is loading
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 12,
            marginTop: 4,
            marginBottom: 4,
          },
          tabBarIconStyle: {
            marginTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="meetings"
          options={{
            title: 'Meetings',
            tabBarIcon: ({ size, color }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tools"
          options={{
            title: 'Tools',
            tabBarIcon: ({ size, color }) => (
              <Grid size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <Stack.Screen name="/screens/classroom" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="/screens/business" options={{ presentation: 'modal', headerShown: false }} />
    </>
  );
}