import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedLinearGradient } from './ThemedLinearGradient';

interface SocialAuthLoadingProps {
  visible: boolean;
  provider: 'google' | 'facebook' | null;
}

export const SocialAuthLoading: React.FC<SocialAuthLoadingProps> = ({ visible, provider }) => {
  const { theme } = useTheme();

  const getProviderInfo = () => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google',
          color: '#4285F4',
          message: 'Connecting to Google...'
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: '#1877F2',
          message: 'Connecting to Facebook...'
        };
      default:
        return {
          name: 'Social Provider',
          color: theme.colors.primary,
          message: 'Connecting...'
        };
    }
  };

  const providerInfo = getProviderInfo();
  const styles = createStyles(theme, providerInfo.color);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ThemedLinearGradient style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color={providerInfo.color} />
            </View>
            
            <Text style={styles.title}>Signing in with {providerInfo.name}</Text>
            <Text style={styles.message}>{providerInfo.message}</Text>
            
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </ThemedLinearGradient>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 40,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: accentColor + '30',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: accentColor,
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.4,
  },
});
