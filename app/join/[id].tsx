import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Video, MicOff, VideoOff, Settings, Users, ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function JoinScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const { user } = useAuth();

  const meetingInfo = {
    title: 'Team Standup Meeting',
    host: 'Emily Johnson',
    participants: 3,
    time: '10:30 AM',
  };

  const handleJoinCall = () => {
    router.push(`/call/${id}_prejoin`);
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join Meeting</Text>
        </View>

        <View style={styles.content}>
          {/* Meeting Info */}
          <View style={styles.meetingInfoCard}>
            <Text style={styles.meetingTitle}>{meetingInfo.title}</Text>
            <View style={styles.meetingDetails}>
              <Text style={styles.meetingHost}>Hosted by {meetingInfo.host}</Text>
              <View style={styles.meetingMeta}>
                <Users size={16} color={theme.colors.textSecondary} />
                <Text style={styles.participantCount}>{meetingInfo.participants} participants</Text>
                <Text style={styles.meetingTime}>{meetingInfo.time}</Text>
              </View>
            </View>
          </View>

          {/* Video Preview */}
          <View style={styles.previewContainer}>
            <View style={styles.videoPreview}>
              <Image 
                source={user.avatar ? { uri: user.avatar } : require('../../assets/images/Insync logo.png')}
                style={styles.previewImage}
                resizeMode="cover"
              />
              {!isVideoOn && (
                <View style={styles.videoOffOverlay}>
                  <VideoOff color={theme.colors.textSecondary} size={48} />
                  <Text style={styles.videoOffText}>Camera is off</Text>
                </View>
              )}
              
              {/* Preview Controls */}
              <View style={styles.previewControls}>
                <TouchableOpacity 
                  style={[styles.previewControlButton, isMuted && styles.previewControlButtonMuted]} 
                  onPress={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <MicOff color={isMuted ? "#F44336" : theme.colors.text} size={20} />
                  ) : (
                    <Mic color={theme.colors.text} size={20} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.previewControlButton, !isVideoOn && styles.previewControlButtonMuted]} 
                  onPress={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? (
                    <Video color={theme.colors.text} size={20} />
                  ) : (
                    <VideoOff color="#F44336" size={20} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.previewControlButton}>
                  <Settings color={theme.colors.text} size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Ready Status */}
          <View style={styles.readyStatus}>
            <Text style={styles.readyTitle}>Ready to join?</Text>
            <Text style={styles.readySubtitle}>
              {isMuted ? 'Microphone is muted' : 'Microphone is on'} • {isVideoOn ? 'Camera is on' : 'Camera is off'}
            </Text>
          </View>

          {/* Join Button */}
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinCall}>
            <Text style={styles.joinButtonText}>Join Meeting</Text>
          </TouchableOpacity>

          {/* Additional Options */}
          <View style={styles.additionalOptions}>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Join by phone instead</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Test speaker and microphone</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  meetingInfoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  meetingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  meetingDetails: {
    gap: 8,
  },
  meetingHost: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  meetingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  meetingTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  videoPreview: {
    width: 280,
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.card,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  videoOffOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  previewControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  previewControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewControlButtonMuted: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  readyStatus: {
    alignItems: 'center',
    marginBottom: 32,
  },
  readyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  readySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  joinButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  additionalOptions: {
    alignItems: 'center',
    gap: 16,
  },
  optionButton: {
    paddingVertical: 12,
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});