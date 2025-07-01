import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    overlay: string;
    gradientStart: string;
    gradientMiddle: string;
    gradientEnd: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#4FC3F7',
    secondary: '#29B6F6',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#E0E0E0',
    accent: '#4FC3F7',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradientStart: '#F8F9FA',
    gradientMiddle: '#E3F2FD',
    gradientEnd: '#BBDEFB',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#4FC3F7',
    secondary: '#29B6F6',
    background: '#1a1a2e',
    surface: '#16213e',
    card: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: '#4FC3F7',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    overlay: 'rgba(0, 0, 0, 0.8)',
    gradientStart: '#1a1a2e',
    gradientMiddle: '#16213e',
    gradientEnd: '#0f3460',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@insync_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // Load saved theme preference
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.log('Error loading theme mode:', error);
      }
    };
    loadThemeMode();
  }, []);

  // Determine current theme based on mode and system preference
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getCurrentTheme();

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.log('Error saving theme mode:', error);
    }
  };

  const toggleTheme = () => {
    const currentIsDark = theme.isDark;
    setThemeMode(currentIsDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}