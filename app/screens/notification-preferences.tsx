import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone, Save, RotateCcw } from 'lucide-react-native';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';
import { apiService, NotificationPreferenceDto } from '@/services/api';

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferenceDto | null>(null);

  const styles = createStyles(theme);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await apiService.getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      await apiService.updateNotificationPreferences(preferences);
      Alert.alert('Success', 'Notification preferences saved successfully');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = async () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all notification preferences to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const defaultPrefs = await apiService.resetNotificationPreferences();
              setPreferences(defaultPrefs);
              Alert.alert('Success', 'Notification preferences reset to defaults');
            } catch (error) {
              console.error('Failed to reset notification preferences:', error);
              Alert.alert('Error', 'Failed to reset notification preferences');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const updatePreference = (field: keyof NotificationPreferenceDto, value: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [field]: value,
    });
  };

  const notificationTypes = [
    {
      key: 'MeetingReminder15Min',
      title: '15-Minute Reminder',
      description: 'Receive notification 15 minutes before meeting starts',
    },
    {
      key: 'MeetingReminder5Min',
      title: '5-Minute Reminder',
      description: 'Receive notification 5 minutes before meeting starts',
    },
    {
      key: 'MeetingStarted',
      title: 'Meeting Started',
      description: 'Receive notification when meeting begins',
    },
    {
      key: 'MeetingEndingSoon',
      title: 'Meeting Ending Soon',
      description: 'Receive notification 5 minutes before meeting ends',
    },
    {
      key: 'MeetingEnded',
      title: 'Meeting Ended',
      description: 'Receive notification when meeting officially ends',
    },
    {
      key: 'MeetingCancelled',
      title: 'Meeting Cancelled',
      description: 'Receive immediate notification when meeting is cancelled',
    },
    {
      key: 'MeetingRescheduled',
      title: 'Meeting Rescheduled',
      description: 'Receive immediate notification when meeting is rescheduled',
    },
  ];

  if (loading) {
    return (
      <ThemedLinearGradient style={styles.container}>
        <AnimatedBackgroundCircle />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Notification Preferences</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading preferences...</Text>
          </View>
        </SafeAreaView>
      </ThemedLinearGradient>
    );
  }

  if (!preferences) {
    return (
      <ThemedLinearGradient style={styles.container}>
        <AnimatedBackgroundCircle />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Notification Preferences</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load preferences</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPreferences}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedLinearGradient>
    );
  }

  return (
    <ThemedLinearGradient style={styles.container}>
      <AnimatedBackgroundCircle />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Preferences</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.description}>
            <Bell size={24} color={theme.colors.primary} />
            <Text style={styles.descriptionText}>
              Configure how you want to receive meeting notifications. You can customize preferences for email, SMS, and push notifications.
            </Text>
          </View>

          {notificationTypes.map((notificationType) => (
            <View key={notificationType.key} style={styles.notificationSection}>
              <Text style={styles.notificationTitle}>{notificationType.title}</Text>
              <Text style={styles.notificationDescription}>{notificationType.description}</Text>
              
              <View style={styles.channelsContainer}>
                {/* Email Channel */}
                <View style={styles.channelRow}>
                  <View style={styles.channelInfo}>
                    <Mail size={20} color={theme.colors.primary} />
                    <Text style={styles.channelText}>Email</Text>
                  </View>
                  <Switch
                    value={preferences[`email${notificationType.key}` as keyof NotificationPreferenceDto] as boolean}
                    onValueChange={(value) => updatePreference(`email${notificationType.key}` as keyof NotificationPreferenceDto, value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                    thumbColor={preferences[`email${notificationType.key}` as keyof NotificationPreferenceDto] ? theme.colors.primary : theme.colors.textTertiary}
                  />
                </View>

                {/* SMS Channel */}
                <View style={styles.channelRow}>
                  <View style={styles.channelInfo}>
                    <MessageSquare size={20} color={theme.colors.success} />
                    <Text style={styles.channelText}>SMS</Text>
                  </View>
                  <Switch
                    value={preferences[`sms${notificationType.key}` as keyof NotificationPreferenceDto] as boolean}
                    onValueChange={(value) => updatePreference(`sms${notificationType.key}` as keyof NotificationPreferenceDto, value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.success + '40' }}
                    thumbColor={preferences[`sms${notificationType.key}` as keyof NotificationPreferenceDto] ? theme.colors.success : theme.colors.textTertiary}
                  />
                </View>

                {/* Push Channel */}
                <View style={styles.channelRow}>
                  <View style={styles.channelInfo}>
                    <Smartphone size={20} color={theme.colors.warning} />
                    <Text style={styles.channelText}>Push</Text>
                  </View>
                  <Switch
                    value={preferences[`push${notificationType.key}` as keyof NotificationPreferenceDto] as boolean}
                    onValueChange={(value) => updatePreference(`push${notificationType.key}` as keyof NotificationPreferenceDto, value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.warning + '40' }}
                    thumbColor={preferences[`push${notificationType.key}` as keyof NotificationPreferenceDto] ? theme.colors.warning : theme.colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          ))}

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetPreferences}
              disabled={saving}
            >
              <RotateCcw size={20} color={theme.colors.textSecondary} />
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={savePreferences}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Save size={20} color="#ffffff" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedLinearGradient>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  description: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    margin: 24,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  notificationSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  notificationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  channelsContainer: {
    gap: 12,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginLeft: 12,
  },
  actionButtons: {
    padding: 24,
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
});
