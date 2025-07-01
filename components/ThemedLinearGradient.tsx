import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { ViewStyle } from 'react-native';

interface ThemedLinearGradientProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ThemedLinearGradient({ children, style }: ThemedLinearGradientProps) {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[
        theme.colors.gradientStart,
        theme.colors.gradientMiddle,
        theme.colors.gradientEnd,
      ]}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}