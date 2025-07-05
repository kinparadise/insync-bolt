import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Image, Animated, Vibration } from 'react-native';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService, CallDto, InitiateCallRequest } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Contact interface to match the contacts screen
export type InAppCallContact = {
  id: string;
  name: string;
  email: string;
  status: string;
  avatar?: string;
  department: string;
  lastSeen: string;
  phone?: string;
};

// Call states
export type CallState = 'idle' | 'initiating' | 'ringing' | 'connecting' | 'active' | 'ended';

interface CallManager {
  currentCall: CallDto | null;
  callState: CallState;
  initiateCall: (contact: InAppCallContact, isVideo: boolean) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  declineCall: (callId: string, reason?: string) => Promise<void>;
  endCall: (callId: string, reason?: string) => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeakerOn: boolean;
}

// Global call manager instance
let globalCallManager: CallManager | null = null;

export function useCallManager(): CallManager {
  const { user } = useAuth();
  const [currentCall, setCurrentCall] = useState<CallDto | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    // Poll for incoming calls
    const pollIncomingCalls = async () => {
      if (user && callState === 'idle') {
        try {
          const incomingCalls = await apiService.getIncomingCalls();
          if (incomingCalls.length > 0) {
            const call = incomingCalls[0];
            setCurrentCall(call);
            setCallState('ringing');
            Vibration.vibrate([500, 200, 500, 200, 500]);
          }
        } catch (error) {
          console.error('Error polling incoming calls:', error);
        }
      }
    };

    const interval = setInterval(pollIncomingCalls, 3000);
    return () => clearInterval(interval);
  }, [user, callState]);

  const initiateCall = async (contact: InAppCallContact, isVideo: boolean) => {
    try {
      setCallState('initiating');
      const request: InitiateCallRequest = {
        receiverId: parseInt(contact.id),
        type: isVideo ? 'VIDEO' : 'AUDIO',
      };
      
      const call = await apiService.initiateCall(request);
      setCurrentCall(call);
      setCallState('ringing');
      setIsVideoOn(isVideo);
    } catch (error) {
      console.error('Error initiating call:', error);
      Alert.alert('Call Failed', 'Unable to initiate call. Please try again.');
      setCallState('idle');
    }
  };

  const acceptCall = async (callId: string) => {
    try {
      setCallState('connecting');
      const call = await apiService.acceptCall(callId);
      setCurrentCall(call);
      setCallState('active');
      Vibration.cancel();
    } catch (error) {
      console.error('Error accepting call:', error);
      Alert.alert('Call Failed', 'Unable to accept call.');
      setCallState('idle');
      setCurrentCall(null);
    }
  };

  const declineCall = async (callId: string, reason?: string) => {
    try {
      await apiService.declineCall(callId, reason);
      setCallState('ended');
      setCurrentCall(null);
      Vibration.cancel();
      setTimeout(() => setCallState('idle'), 2000);
    } catch (error) {
      console.error('Error declining call:', error);
      setCallState('idle');
      setCurrentCall(null);
    }
  };

  const endCall = async (callId: string, reason?: string) => {
    try {
      await apiService.endCall(callId, reason);
      setCallState('ended');
      setTimeout(() => {
        setCallState('idle');
        setCurrentCall(null);
      }, 2000);
    } catch (error) {
      console.error('Error ending call:', error);
      setCallState('idle');
      setCurrentCall(null);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn);

  const manager: CallManager = {
    currentCall,
    callState,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    isMuted,
    isVideoOn,
    isSpeakerOn,
  };

  globalCallManager = manager;
  return manager;
}

// Function to start in-app call (for backward compatibility)
export function startInAppCall(contact: InAppCallContact, isVideo: boolean = false) {
  if (globalCallManager) {
    globalCallManager.initiateCall(contact, isVideo);
  }
}

// Enhanced In-App Call Screen Component
export function InAppCallScreen() {
  const callManager = useCallManager();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [callDuration, setCallDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: any;
    if (callManager.callState === 'active' && callManager.currentCall?.startedAt) {
      interval = setInterval(() => {
        const startTime = new Date(callManager.currentCall!.startedAt!);
        const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callManager.callState, callManager.currentCall]);

  useEffect(() => {
    if (callManager.callState === 'ringing') {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (callManager.callState === 'ringing') {
            pulse();
          }
        });
      };
      pulse();
    }
  }, [callManager.callState, pulseAnim]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    switch (callManager.callState) {
      case 'initiating':
        return 'Initiating call...';
      case 'ringing':
        return callManager.currentCall?.caller.id === user?.id ? 'Ringing...' : 'Incoming call';
      case 'connecting':
        return 'Connecting...';
      case 'active':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  const getOtherParticipant = () => {
    if (!callManager.currentCall || !user) return null;
    return callManager.currentCall.caller.id === user.id 
      ? callManager.currentCall.receiver 
      : callManager.currentCall.caller;
  };

  const otherParticipant = getOtherParticipant();
  const isIncomingCall = callManager.currentCall?.caller.id !== user?.id && callManager.callState === 'ringing';

  if (callManager.callState === 'idle' || !callManager.currentCall) {
    return null;
  }

  const styles = createCallStyles(theme);

  return (
    <Modal visible={true} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.participantInfo}>
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Image 
                source={{ uri: otherParticipant?.avatar || 'https://via.placeholder.com/120' }} 
                style={styles.avatar} 
              />
            </Animated.View>
            <Text style={styles.participantName}>{otherParticipant?.name}</Text>
            <Text style={styles.callStatus}>{getCallStatusText()}</Text>
            <Text style={styles.callType}>
              {callManager.currentCall.type === 'VIDEO' ? 'Video Call' : 'Audio Call'}
            </Text>
          </View>
        </View>

        <View style={styles.videoContainer}>
          {callManager.currentCall.type === 'VIDEO' && callManager.callState === 'active' ? (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderText}>Video Stream</Text>
              <Text style={styles.videoSubtext}>Camera integration pending</Text>
            </View>
          ) : (
            <View style={styles.audioCallPlaceholder}>
              <Phone size={64} color={theme.colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.controls}>
          {callManager.callState === 'active' && (
            <View style={styles.activeControls}>
              <TouchableOpacity
                style={[styles.controlButton, callManager.isMuted && styles.controlButtonActive]}
                onPress={callManager.toggleMute}
              >
                {callManager.isMuted ? (
                  <MicOff size={24} color="#fff" />
                ) : (
                  <Mic size={24} color="#fff" />
                )}
              </TouchableOpacity>

              {callManager.currentCall.type === 'VIDEO' && (
                <TouchableOpacity
                  style={[styles.controlButton, !callManager.isVideoOn && styles.controlButtonActive]}
                  onPress={callManager.toggleVideo}
                >
                  {callManager.isVideoOn ? (
                    <Video size={24} color="#fff" />
                  ) : (
                    <VideoOff size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.controlButton, callManager.isSpeakerOn && styles.controlButtonActive]}
                onPress={callManager.toggleSpeaker}
              >
                {callManager.isSpeakerOn ? (
                  <Volume2 size={24} color="#fff" />
                ) : (
                  <VolumeX size={24} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <MessageCircle size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.primaryControls}>
            {isIncomingCall ? (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.acceptButton]}
                  onPress={() => callManager.acceptCall(callManager.currentCall!.callId)}
                >
                  <Phone size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.declineButton]}
                  onPress={() => callManager.declineCall(callManager.currentCall!.callId)}
                >
                  <PhoneOff size={24} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, styles.endButton]}
                onPress={() => callManager.endCall(callManager.currentCall!.callId)}
              >
                <PhoneOff size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createCallStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  participantInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  participantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 4,
  },
  callType: {
    fontSize: 14,
    color: '#999',
  },
  videoContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '90%',
    height: '80%',
    backgroundColor: '#333',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  videoSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  audioCallPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flex: 0.2,
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: theme.colors.error,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  primaryButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  declineButton: {
    backgroundColor: theme.colors.error,
  },
  endButton: {
    backgroundColor: theme.colors.error,
  },
}); 