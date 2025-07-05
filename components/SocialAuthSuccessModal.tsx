import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedLinearGradient } from './ThemedLinearGradient';
import { Check, X } from 'lucide-react-native';

interface SocialAuthSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    name: string;
    email: string;
    picture?: string;
    provider: 'google' | 'facebook';
  } | null;
}

export const SocialAuthSuccessModal: React.FC<SocialAuthSuccessModalProps> = ({ 
  visible, 
  onClose, 
  userData 
}) => {
  const { theme } = useTheme();

  const getProviderInfo = () => {
    switch (userData?.provider) {
      case 'google':
        return {
          name: 'Google',
          color: '#4285F4',
          bgColor: '#E8F0FE'
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: '#1877F2',
          bgColor: '#E7F3FF'
        };
      default:
        return {
          name: 'Social Provider',
          color: theme.colors.primary,
          bgColor: theme.colors.primary + '20'
        };
    }
  };

  const providerInfo = getProviderInfo();
  const styles = createStyles(theme, providerInfo.color);

  if (!userData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ThemedLinearGradient style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={[styles.successIcon, { backgroundColor: providerInfo.bgColor }]}>
              <Check size={32} color={providerInfo.color} />
            </View>
            
            <Text style={styles.title}>Welcome to InSync!</Text>
            <Text style={styles.subtitle}>
              Successfully signed in with {providerInfo.name}
            </Text>

            <View style={styles.userInfo}>
              <Image 
                source={
                  userData.picture 
                    ? { uri: userData.picture }
                    : require('../assets/images/icon.png')
                } 
                style={styles.avatar} 
              />
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>

            <Text style={styles.description}>
              You can now access all features including video calls, 
              meetings, and collaboration tools.
            </Text>

            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue to App</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: accentColor,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
