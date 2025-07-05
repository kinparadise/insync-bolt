import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, FlatList, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mic, Speaker, Camera, ChevronRight, Bell, Shield, CircleHelp as HelpCircle, LogOut, Sun, Moon, Monitor, User, Edit, Clock, Smartphone, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { logout, user, updateUserStatus, clearAllData } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  // Safety check for theme
  if (!theme) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#ffffff', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

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
  const cameraList = ['FaceTime HD Camera', 'External Webcam', 'iPhone Camera'];

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return <Sun color={theme.colors.text} size={20} />;
      case 'dark': return <Moon color={theme.colors.text} size={20} />;
      case 'system': return <Monitor color={theme.colors.text} size={20} />;
    }
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all stored data including login information, preferences, and session data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared. You will need to log in again.');
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/auth/profile')}>
              <Image 
                source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') }} 
                style={styles.profileAvatar} 
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                  <Text style={styles.statusText}>{user?.status || 'ONLINE'}</Text>
                </View>
              </View>
              <Edit color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Session Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session & Security</Text>
            
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowSecurityDetails(!showSecurityDetails)}>
              <View style={styles.settingInfo}>
                <Shield color={theme.colors.success} size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Security Status</Text>
                  <Text style={styles.settingDescription}>Your account is secure and protected</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>

            {showSecurityDetails && (
              <View style={styles.securityDetailsCard}>
                <View style={styles.securityFeatures}>
                  <Text style={styles.securityFeature}>• End-to-end encryption</Text>
                  <Text style={styles.securityFeature}>• Secure token storage</Text>
                  <Text style={styles.securityFeature}>• Automatic session management</Text>
                </View>
                
                {/* Clear All Data - Integrated */}
                <View style={styles.securityActions}>
                  <TouchableOpacity style={styles.clearDataButton} onPress={handleClearAllData}>
                    <Trash2 color={theme.colors.error} size={16} />
                    <Text style={styles.clearDataButtonText}>Clear All Data</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell color={theme.colors.primary} size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>Receive meeting reminders and updates</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={notifications ? '#ffffff' : theme.colors.textSecondary}
              />
            </View>
          </View>

          {/* Theme Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <TouchableOpacity style={styles.themeSelector} onPress={() => {
              const modes: ThemeMode[] = ['light', 'dark', 'system'];
              const currentIndex = modes.indexOf(themeMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              setThemeMode(nextMode);
            }}>
              <View style={styles.themeInfo}>
                {getThemeIcon(themeMode)}
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Theme</Text>
                  <Text style={styles.settingDescription}>{getThemeLabel(themeMode)} mode</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Audio & Video Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio & Video</Text>
            
            <TouchableOpacity style={styles.settingRow} onPress={() => setMicModal(true)}>
              <View style={styles.settingInfo}>
                <Mic color={theme.colors.primary} size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Microphone</Text>
                  <Text style={styles.settingDescription}>{selectedMic}</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => setSpeakerModal(true)}>
              <View style={styles.settingInfo}>
                <Speaker color={theme.colors.primary} size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Speaker</Text>
                  <Text style={styles.settingDescription}>{selectedSpeaker}</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => setCameraModal(true)}>
              <View style={styles.settingInfo}>
                <Camera color={theme.colors.primary} size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Camera</Text>
                  <Text style={styles.settingDescription}>{selectedCamera}</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://insync.app/help')}>
              <View style={styles.settingInfo}>
                <HelpCircle color={theme.colors.primary} size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingDescription}>Get help and contact support</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://insync.app/privacy')}>
              <View style={styles.settingInfo}>
                <Shield color={theme.colors.primary} size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Privacy Policy</Text>
                  <Text style={styles.settingDescription}>How we protect your data</Text>
                </View>
              </View>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Sign Out Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut color={theme.colors.error} size={20} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Insync v1.0.0</Text>
          </View>
        </ScrollView>

        {/* Device Selection Modals */}
        <Modal visible={micModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Microphone</Text>
                <TouchableOpacity onPress={() => setMicModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={micList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, selectedMic === item && styles.modalItemSelected]}
                    onPress={() => {
                      setSelectedMic(item);
                      setMicModal(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, selectedMic === item && styles.modalItemTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Modal visible={speakerModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Speaker</Text>
                <TouchableOpacity onPress={() => setSpeakerModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={speakerList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, selectedSpeaker === item && styles.modalItemSelected]}
                    onPress={() => {
                      setSelectedSpeaker(item);
                      setSpeakerModal(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, selectedSpeaker === item && styles.modalItemTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Modal visible={cameraModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Camera</Text>
                <TouchableOpacity onPress={() => setCameraModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={cameraList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, selectedCamera === item && styles.modalItemSelected]}
                    onPress={() => {
                      setSelectedCamera(item);
                      setCameraModal(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, selectedCamera === item && styles.modalItemTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  sessionInfoCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionInfoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  sessionInfoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    flex: 1,
  },

  securityFeatures: {
    marginTop: 16,
  },
  securityFeature: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  securityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  clearDataButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.error,
    marginLeft: 8,
  },

  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.error,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  modalClose: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.textSecondary,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalItemSelected: {
    backgroundColor: theme.colors.primary + '15',
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  modalItemTextSelected: {
    color: theme.colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  securityDetailsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});