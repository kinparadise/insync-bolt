import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, TextInput, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, Video, VideoOff, Users, Shield, Square, Settings, ChevronLeft, Lock, MessageCircle, Star, UserPlus, Volume2, Camera, Phone, RefreshCw } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

export default function PreJoinScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  // Strip '_prejoin' suffix if present
  const meetingId = typeof id === 'string' ? id.replace(/_prejoin$/, '') : '';
  const { theme } = useTheme();
  const { user } = useAuth();
  const { width, height } = Dimensions.get('window');

  // Host settings
  const [muteAll, setMuteAll] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [recording, setRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [meetingPassword, setMeetingPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [allowChat, setAllowChat] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [allowScreenSharing, setAllowScreenSharing] = useState(true);
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [isLoadingMeetingInfo, setIsLoadingMeetingInfo] = useState(true);

  // Load meeting information
  useEffect(() => {
    const loadMeetingInfo = async () => {
      try {
        if (meetingId && meetingId.trim() !== '') {
          setIsLoadingMeetingInfo(true);
          // Set default meeting info for now
          setMeetingInfo({
            title: 'Video Meeting',
            participantCount: 0,
            host: user?.name || 'Host',
          });
        }
      } catch (error) {
        console.error('Failed to load meeting info:', error);
        // Continue without meeting info
      } finally {
        setIsLoadingMeetingInfo(false);
      }
    };

    loadMeetingInfo();
  }, [meetingId, user?.name]);

  const handleStartMeeting = async () => {
    if (!meetingId) {
      Alert.alert('Error', 'Meeting ID is required');
      return;
    }

    setIsLoading(true);
    try {
      // Apply host settings to the backend
      await apiService.applyHostSettings(meetingId as string, {
        muteAll,
        waitingRoom,
        recording,
        hostMuted: isMuted,
        hostVideoOff: !isVideoOn,
      });

      // Update meeting settings with advanced options
      await apiService.updateMeetingSettings(meetingId as string, {
        muteAllParticipants: muteAll,
        enableWaitingRoom: waitingRoom,
        enableRecording: recording,
        hostAudioMuted: isMuted,
        hostVideoOff: !isVideoOn,
        allowChat,
        allowReactions,
        allowScreenSharing,
        transcriptionEnabled,
        maxParticipants: parseInt(maxParticipants) || 50,
        meetingPassword: meetingPassword.trim() || undefined,
      });

      // Navigate to the call screen
      router.replace(`/call/${meetingId}`);
    } catch (error) {
      console.error('Failed to apply meeting settings:', error);
      Alert.alert(
        'Settings Error',
        'Failed to apply meeting settings. The meeting will start with default settings.',
        [
          { text: 'Continue Anyway', onPress: () => router.replace(`/call/${meetingId}`) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Ready to Join?</Text>
        </View>

        {/* Video Preview Section */}
        <View style={styles.videoPreviewSection}>
          <View style={styles.videoPreview}>
            {isVideoOn ? (
              <View style={styles.cameraPreview}>
                <Image 
                  source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random` }} 
                  style={styles.userAvatar}
                />
                <View style={styles.cameraOverlay}>
                  <Camera color="#ffffff" size={24} />
                  <Text style={styles.cameraText}>Camera Preview</Text>
                </View>
              </View>
            ) : (
              <View style={styles.videoOffContainer}>
                <Image 
                  source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random` }} 
                  style={styles.userAvatarLarge}
                />
                <Text style={styles.videoOffText}>Camera is off</Text>
              </View>
            )}
          </View>

          {/* Audio/Video Controls */}
          <View style={styles.avControls}>
            <TouchableOpacity 
              style={[styles.avButton, isMuted && styles.avButtonMuted]}
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff color="#ffffff" size={24} /> : <Mic color="#ffffff" size={24} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.avButton, !isVideoOn && styles.avButtonMuted]}
              onPress={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video color="#ffffff" size={24} /> : <VideoOff color="#ffffff" size={24} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.avButton}>
              <Settings color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meeting Info Card */}
        <View style={styles.meetingInfoCard}>
          {isLoadingMeetingInfo ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
              <Text style={styles.loadingText}>Loading meeting info...</Text>
            </View>
          ) : (
            <>
              <View style={styles.meetingHeader}>
                <View style={styles.meetingIcon}>
                  <Video color={theme.colors.primary} size={20} />
                </View>
                <View style={styles.meetingDetails}>
                  <Text style={styles.meetingTitle}>
                    {meetingInfo?.title || 'Video Meeting'}
                  </Text>
                  <Text style={styles.meetingId}>ID: {meetingId}</Text>
                </View>
              </View>
              
              <View style={styles.meetingMeta}>
                <View style={styles.metaItem}>
                  <Users color={theme.colors.textSecondary} size={16} />
                  <Text style={styles.metaText}>
                    {meetingInfo?.participantCount || 0} participants
                  </Text>
                </View>
                {meetingInfo?.host && (
                  <View style={styles.metaItem}>
                    <Star color={theme.colors.textSecondary} size={16} />
                    <Text style={styles.metaText}>
                      Host: {meetingInfo.host}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Host Controls</Text>
          <View style={styles.toggleRow}>
            <Users color={theme.colors.primary} size={20} />
            <Text style={styles.toggleLabel}>Mute All Participants</Text>
            <Switch value={muteAll} onValueChange={setMuteAll} />
          </View>
          <View style={styles.toggleRow}>
            <Shield color={theme.colors.primary} size={20} />
            <Text style={styles.toggleLabel}>Enable Waiting Room</Text>
            <Switch value={waitingRoom} onValueChange={setWaitingRoom} />
          </View>
          <View style={styles.toggleRow}>
            <Square color={theme.colors.primary} size={20} />
            <Text style={styles.toggleLabel}>Enable Recording</Text>
            <Switch value={recording} onValueChange={setRecording} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Video</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.avButton}>
              {isMuted ? <MicOff color="#fff" size={20} /> : <Mic color="#fff" size={20} />}
            </TouchableOpacity>
            <Text style={styles.toggleLabel}>{isMuted ? 'Muted' : 'Microphone On'}</Text>
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => setIsVideoOn(!isVideoOn)} style={styles.avButton}>
              {isVideoOn ? <Video color="#fff" size={20} /> : <VideoOff color="#fff" size={20} />}
            </TouchableOpacity>
            <Text style={styles.toggleLabel}>{isVideoOn ? 'Camera On' : 'Camera Off'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.advancedToggle}
          onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Settings color={theme.colors.primary} size={20} />
          <Text style={styles.advancedToggleText}>Advanced Settings</Text>
          <Text style={styles.advancedToggleIcon}>{showAdvancedSettings ? '−' : '+'}</Text>
        </TouchableOpacity>

        {showAdvancedSettings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advanced Options</Text>
            
            <View style={styles.inputRow}>
              <Lock color={theme.colors.primary} size={20} />
              <Text style={styles.inputLabel}>Meeting Password (Optional)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={meetingPassword}
              onChangeText={setMeetingPassword}
              placeholder="Enter password to protect meeting"
              placeholderTextColor={theme.colors.textTertiary}
            />

            <View style={styles.inputRow}>
              <UserPlus color={theme.colors.primary} size={20} />
              <Text style={styles.inputLabel}>Max Participants</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              placeholder="50"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
            />

            <View style={styles.toggleRow}>
              <MessageCircle color={theme.colors.primary} size={20} />
              <Text style={styles.toggleLabel}>Allow Chat</Text>
              <Switch value={allowChat} onValueChange={setAllowChat} />
            </View>

            <View style={styles.toggleRow}>
              <Star color={theme.colors.primary} size={20} />
              <Text style={styles.toggleLabel}>Allow Reactions</Text>
              <Switch value={allowReactions} onValueChange={setAllowReactions} />
            </View>

            <View style={styles.toggleRow}>
              <Video color={theme.colors.primary} size={20} />
              <Text style={styles.toggleLabel}>Allow Screen Sharing</Text>
              <Switch value={allowScreenSharing} onValueChange={setAllowScreenSharing} />
            </View>

            <View style={styles.toggleRow}>
              <Volume2 color={theme.colors.primary} size={20} />
              <Text style={styles.toggleLabel}>Enable Transcription</Text>
              <Switch value={transcriptionEnabled} onValueChange={setTranscriptionEnabled} />
            </View>
          </View>
        )}

        {/* Join/Cancel Buttons */}
        <View style={styles.joinButtonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.joinButton, isLoading && styles.startButtonDisabled]} 
            onPress={handleStartMeeting}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Phone color="#ffffff" size={20} />
                <Text style={styles.joinButtonText}>Join Meeting</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  
  // Video Preview Section
  videoPreviewSection: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoPreview: {
    height: 240,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cameraText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  videoOffContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  videoOffText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  
  // Audio/Video Controls
  avControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  avButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avButtonMuted: {
    backgroundColor: theme.colors.error,
  },
  
  // Meeting Info Card
  meetingInfoCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight || theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  meetingDetails: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  meetingMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  
  // Legacy styles (keeping for compatibility)
  card: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  meetingId: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  hostLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  hostName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginLeft: 12,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  advancedToggleText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginLeft: 12,
  },
  advancedToggleIcon: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginLeft: 12,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  
  // New Join Button Styles
  joinButtonContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    gap: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: theme.colors.card,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 