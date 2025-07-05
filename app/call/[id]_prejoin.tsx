import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, Video, VideoOff, Users, Shield, Square, Settings, ChevronLeft, Lock, MessageCircle, Star, UserPlus, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

export default function PreJoinScreen() {
  const router = useRouter();
  const { id: meetingId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Host settings
  const [muteAll, setMuteAll] = useState(true);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Pre-Join Meeting</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.meetingLabel}>Meeting ID</Text>
          <Text style={styles.meetingId}>{meetingId}</Text>
          <Text style={styles.hostLabel}>Host</Text>
          <Text style={styles.hostName}>{user?.name || 'You'}</Text>
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

        <TouchableOpacity 
          style={[styles.startButton, isLoading && styles.startButtonDisabled]} 
          onPress={handleStartMeeting}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.startButtonText}>Start Meeting</Text>
          )}
        </TouchableOpacity>
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
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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
  avButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
}); 