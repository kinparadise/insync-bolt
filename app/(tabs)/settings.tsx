import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mic, Speaker, Camera, ChevronRight, Bell, Shield, CircleHelp as HelpCircle, LogOut, Sun, Moon, Monitor } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);

  // Persistent notification toggle
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('notifications');
      if (saved !== null) setNotifications(saved === 'true');
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem('notifications', notifications ? 'true' : 'false');
  }, [notifications]);

  // Device selection state
  const [micModal, setMicModal] = useState(false);
  const [speakerModal, setSpeakerModal] = useState(false);
  const [cameraModal, setCameraModal] = useState(false);
  const [selectedMic, setSelectedMic] = useState('Microphone Array (Intel)');
  const [selectedSpeaker, setSelectedSpeaker] = useState('Speaker Disarray (Intel)');
  const [selectedCamera, setSelectedCamera] = useState('FaceTime HD Camera');

  // Persist device selections
  useEffect(() => {
    (async () => {
      const mic = await AsyncStorage.getItem('selectedMic');
      const speaker = await AsyncStorage.getItem('selectedSpeaker');
      const camera = await AsyncStorage.getItem('selectedCamera');
      if (mic) setSelectedMic(mic);
      if (speaker) setSelectedSpeaker(speaker);
      if (camera) setSelectedCamera(camera);
    })();
  }, []);
  useEffect(() => { AsyncStorage.setItem('selectedMic', selectedMic); }, [selectedMic]);
  useEffect(() => { AsyncStorage.setItem('selectedSpeaker', selectedSpeaker); }, [selectedSpeaker]);
  useEffect(() => { AsyncStorage.setItem('selectedCamera', selectedCamera); }, [selectedCamera]);

  // Mock device lists
  const micList = ['Microphone Array (Intel)', 'External Mic', 'Bluetooth Mic'];
  const speakerList = ['Speaker Disarray (Intel)', 'Bluetooth Speaker', 'Headphones'];
  const cameraList = ['FaceTime HD Camera', 'USB Camera', 'Virtual Camera'];

  // Privacy & Support navigation
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

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
          subtitle: selectedMic,
          hasArrow: true,
          onPress: () => setMicModal(true),
        },
        {
          icon: Speaker,
          title: 'Speaker',
          subtitle: selectedSpeaker,
          hasArrow: true,
          onPress: () => setSpeakerModal(true),
        },
      ],
    },
    {
      title: 'VIDEO SETTINGS',
      items: [
        {
          icon: Camera,
          title: 'Camera',
          subtitle: selectedCamera,
          hasArrow: true,
          onPress: () => setCameraModal(true),
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
          onPress: () => setShowPrivacy(true),
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
          onPress: () => setShowSupport(true),
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

        {/* Device selection modals */}
        <Modal visible={micModal} transparent animationType="slide" onRequestClose={() => setMicModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Microphone</Text>
              <FlatList data={micList} keyExtractor={item => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.settingItem} onPress={() => { setSelectedMic(item); setMicModal(false); }}>
                  <Text style={{ color: theme.colors.text }}>{item}</Text>
                  {selectedMic === item && <Text style={{ color: theme.colors.primary }}>✓</Text>}
                </TouchableOpacity>
              )} />
              <TouchableOpacity style={styles.cancelButton} onPress={() => setMicModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={speakerModal} transparent animationType="slide" onRequestClose={() => setSpeakerModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Speaker</Text>
              <FlatList data={speakerList} keyExtractor={item => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.settingItem} onPress={() => { setSelectedSpeaker(item); setSpeakerModal(false); }}>
                  <Text style={{ color: theme.colors.text }}>{item}</Text>
                  {selectedSpeaker === item && <Text style={{ color: theme.colors.primary }}>✓</Text>}
                </TouchableOpacity>
              )} />
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSpeakerModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={cameraModal} transparent animationType="slide" onRequestClose={() => setCameraModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Camera</Text>
              <FlatList data={cameraList} keyExtractor={item => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.settingItem} onPress={() => { setSelectedCamera(item); setCameraModal(false); }}>
                  <Text style={{ color: theme.colors.text }}>{item}</Text>
                  {selectedCamera === item && <Text style={{ color: theme.colors.primary }}>✓</Text>}
                </TouchableOpacity>
              )} />
              <TouchableOpacity style={styles.cancelButton} onPress={() => setCameraModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Privacy & Security modal */}
        <Modal visible={showPrivacy} transparent animationType="slide" onRequestClose={() => setShowPrivacy(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Privacy & Security</Text>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={{ color: theme.colors.text }}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={{ color: theme.colors.error }}>Delete Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPrivacy(false)}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Help & Support modal */}
        <Modal visible={showSupport} transparent animationType="slide" onRequestClose={() => setShowSupport(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <Text style={{ color: theme.colors.text, marginBottom: 12 }}>FAQ: For help, visit our website or contact support below.</Text>
              <TouchableOpacity style={styles.settingItem} onPress={() => { Linking.openURL('mailto:support@insync.com'); }}>
                <Text style={{ color: theme.colors.primary }}>Contact Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSupport(false)}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
});