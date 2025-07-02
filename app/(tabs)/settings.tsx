import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mic, Speaker, Camera, ChevronRight, Bell, Shield, CircleHelp as HelpCircle, LogOut, Sun, Moon, Monitor } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const styles = createStyles(theme);

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
    }
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Default';
    }
  };

  const handleSignOut = () => {
    // Navigate to welcome screen instead of auth/welcome
    router.push('/auth/welcome');
  };

  const settingsGroups = [
    {
      title: 'APPEARANCE',
      items: [
        {
          icon: getThemeIcon(themeMode),
          title: 'Theme',
          subtitle: getThemeLabel(themeMode),
          hasArrow: true,
          onPress: () => {
            // Cycle through theme modes
            const modes: ThemeMode[] = ['system', 'light', 'dark'];
            const currentIndex = modes.indexOf(themeMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            setThemeMode(modes[nextIndex]);
          },
        },
      ],
    },
    {
      title: 'AUDIO SETTINGS',
      items: [
        {
          icon: Mic,
          title: 'Microphone',
          subtitle: 'Microphone Array (Intel)',
          hasArrow: true,
        },
        {
          icon: Speaker,
          title: 'Speaker',
          subtitle: 'Speaker Disarray (Intel)',
          hasArrow: true,
        },
      ],
    },
    {
      title: 'VIDEO SETTINGS',
      items: [
        {
          icon: Camera,
          title: 'Camera',
          subtitle: 'FaceTime HD Camera',
          hasArrow: true,
        },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Push notifications for calls and meetings',
          hasSwitch: true,
          switchValue: notifications,
          onSwitchChange: setNotifications,
        },
        {
          icon: Shield,
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          hasArrow: true,
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          hasArrow: true,
        },
      ],
    },
  ];

  return (
    <ThemedLinearGradient style={styles.container}>
      <AnimatedBackgroundCircle />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {settingsGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  disabled={item.hasSwitch}
                  onPress={item.onPress}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <item.icon color={theme.colors.primary} size={20} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.settingRight}>
                    {item.hasArrow && (
                      <ChevronRight color={theme.colors.textTertiary} size={20} />
                    )}
                    {item.hasSwitch && (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor="#ffffff"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.logoutSection}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleSignOut}
            >
              <LogOut color={theme.colors.error} size={20} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>InSync v1.0.0</Text>
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
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  settingsGroup: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  groupTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textTertiary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  settingRight: {
    marginLeft: 16,
  },
  logoutSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.error,
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
});