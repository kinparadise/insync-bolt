import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Video, MicOff, VideoOff, PhoneOff, Users, MessageCircle, Monitor, Settings, MoreHorizontal, Hand, Camera, Volume2, Send, X, Share, UserPlus, Pause, Play, Square, UserX, Shuffle, Plus, Edit3, Trash2, ArrowRight, GraduationCap, Wifi, WifiOff, Battery, Clock, Maximize2, Minimize2, RotateCcw, FileText, Calendar, Filter, Search, ChevronDown, ChevronUp, Star, Flag, Download, Upload, Eye, EyeOff, Zap, Shield, Award, Target, Lightbulb, Timer, BarChart3, TrendingUp, Brain, Globe, Lock, Unlock, PaintBucket, Palette, Music, PlayCircle, StopCircle, FastForward, Rewind, SkipBack, SkipForward, Volume1, VolumeX, Headphones, Speaker } from 'lucide-react-native';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { MeetingSummaryComponent } from '@/components/MeetingSummaryComponent';
import { apiService, MeetingDto, CallParticipant, ChatMessage, PollData, BreakoutRoom, MeetingAnalytics, TranscriptionEntry, CallStateUpdate, ActionItemDto } from '@/services/api';

export default function CallClean() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user, ensureAuthenticated } = useAuth();
  
  // Screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Meeting data and backend integration
  const [meeting, setMeeting] = useState<MeetingDto | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [actionItems, setActionItems] = useState<ActionItemDto[]>([]);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(true);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  
  // Real-time call data
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [polls, setPolls] = useState<PollData[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [transcriptionEntries, setTranscriptionEntries] = useState<TranscriptionEntry[]>([]);
  const [meetingAnalytics, setMeetingAnalytics] = useState<MeetingAnalytics | null>(null);
  
  // Call states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [showCreateBreakout, setShowCreateBreakout] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isInBreakoutRoom, setIsInBreakoutRoom] = useState(false);
  const [currentBreakoutRoom, setCurrentBreakoutRoom] = useState<string | null>(null);

  // Advanced professional features
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [showNetworkStats, setShowNetworkStats] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'speaker' | 'gallery'>('grid');
  const [showReactions, setShowReactions] = useState(false);
  const [audioProcessing, setAudioProcessing] = useState({
    noiseReduction: true,
    echoSuppression: true,
    autoGainControl: true,
  });
  const [videoEffects, setVideoEffects] = useState({
    backgroundBlur: false,
    virtualBackground: false,
    beautyFilter: false,
  });
  const [meetingSecurity, setMeetingSecurity] = useState({
    waitingRoom: true,
    endToEndEncryption: true,
    recordingNotification: true,
  });

  // Real-time analytics
  const [networkStats, setNetworkStats] = useState({
    bandwidth: 2.5, // Mbps
    latency: 45, // ms
    packetLoss: 0.1, // %
    jitter: 12, // ms
  });

  // AI-powered features
  const [aiInsights, setAiInsights] = useState({
    engagementScore: 85,
    talkTime: { user: 12, total: 45 },
    sentimentAnalysis: 'positive' as const,
    keyTopics: ['Q1 Planning', 'Budget Review', 'Team Goals'],
    actionItems: 2,
    recommendations: [
      'Consider reducing meeting length by 10 minutes',
      'Schedule follow-up for budget discussion',
    ],
  });

  // Initialize meeting and load data
  useEffect(() => {
    loadMeetingData();
    startCallDurationTimer();
    initializeRealtimeFeatures();
  }, [id]);

  const loadMeetingData = async () => {
    try {
      setIsLoadingMeeting(true);
      const authenticated = await ensureAuthenticated();
      if (!authenticated) {
        setMeetingError('Authentication required');
        return;
      }

      // Load meeting details
      const meetingData = await apiService.getMeetingById(Number(id));
      setMeeting(meetingData);

      // Load participants
      const participantsData = await apiService.getMeetingParticipants(meetingData.meetingId);
      setParticipants(participantsData);

      // Load chat messages
      const messages = await apiService.getChatMessages(meetingData.meetingId);
      setChatMessages(messages);

      // Load active polls
      const activePolls = await apiService.getActivePolls(meetingData.meetingId);
      setPolls(activePolls);

      // Load breakout rooms
      const rooms = await apiService.getBreakoutRooms(meetingData.meetingId);
      setBreakoutRooms(rooms);

      // Load analytics
      const analytics = await apiService.getMeetingAnalytics(meetingData.meetingId);
      setMeetingAnalytics(analytics);

      // Load transcription
      const transcription = await apiService.getTranscription(meetingData.meetingId);
      setTranscriptionEntries(transcription);

    } catch (error) {
      console.error('Failed to load meeting data:', error);
      setMeetingError(error instanceof Error ? error.message : 'Failed to load meeting');
    } finally {
      setIsLoadingMeeting(false);
    }
  };

  const initializeRealtimeFeatures = () => {
    // Set up WebSocket or polling for real-time updates
    // This would typically connect to a WebSocket server for live updates
    console.log('Initializing real-time features for meeting:', id);
  };

  const startCallDurationTimer = () => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Call', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (meeting) {
                await apiService.leaveMeeting(meeting.id);
              }
              router.back();
            } catch (error) {
              console.error('Failed to leave meeting:', error);
              router.back(); // Still navigate back even if API call fails
            }
          }
        },
      ]
    );
  };

  const handleToggleMute = async () => {
    try {
      setIsMuted(!isMuted);
      if (meeting && user) {
        const callState: CallStateUpdate = {
          participantId: user.id,
          isMuted: !isMuted,
        };
        await apiService.updateCallState(meeting.meetingId, callState);
      }
    } catch (error) {
      console.error('Failed to update mute state:', error);
      // Revert local state on error
      setIsMuted(isMuted);
    }
  };

  const handleToggleVideo = async () => {
    try {
      setIsVideoOn(!isVideoOn);
      if (meeting && user) {
        const callState: CallStateUpdate = {
          participantId: user.id,
          isVideoOn: !isVideoOn,
        };
        await apiService.updateCallState(meeting.meetingId, callState);
      }
    } catch (error) {
      console.error('Failed to update video state:', error);
      // Revert local state on error
      setIsVideoOn(isVideoOn);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !meeting) return;
    
    try {
      const newMessage = await apiService.sendChatMessage(meeting.meetingId, chatMessage.trim());
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleStartRecording = async () => {
    try {
      if (!meeting) return;
      
      if (isRecording) {
        await apiService.stopRecording(meeting.meetingId);
        setIsRecording(false);
        Alert.alert('Recording Stopped', 'The meeting recording has been stopped.');
      } else {
        await apiService.startRecording(meeting.meetingId);
        setIsRecording(true);
        Alert.alert('Recording Started', 'The meeting is now being recorded.');
      }
    } catch (error) {
      console.error('Failed to toggle recording:', error);
      Alert.alert('Error', 'Failed to toggle recording. Please try again.');
    }
  };

  if (isLoadingMeeting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Joining meeting...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (meetingError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {meetingError}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadMeetingData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1a1a1a' }]}>
      <ThemedLinearGradient style={styles.container}>
        {/* Header with Meeting Info */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.securityBadge}>
              <Shield size={16} color="#4ade80" />
              <Text style={styles.securityText}>Secure</Text>
            </View>
            <View style={[styles.qualityIndicator, { backgroundColor: getQualityColor(connectionQuality) }]}>
              <Wifi size={14} color="white" />
              <Text style={styles.qualityText}>{connectionQuality}</Text>
            </View>
          </View>
          
          <View style={styles.headerCenter}>
            <Text style={styles.meetingTitle}>{meeting?.title || 'Meeting'}</Text>
            <Text style={styles.meetingTime}>{formatDuration(callDuration)}</Text>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.participantCount}>{participants.length}</Text>
            <Users size={18} color="white" />
            {meetingAnalytics && (
              <View style={styles.engagementScore}>
                <Text style={styles.engagementText}>{meetingAnalytics.engagementScore}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Main Video Area */}
        <View style={styles.videoContainer}>
          {participants.length > 0 && (
            <View style={styles.mainParticipantContainer}>
              {participants[0]?.isVideoOn ? (
                <Image 
                  source={{ uri: participants[0]?.user?.avatar || 'https://via.placeholder.com/300' }} 
                  style={styles.mainParticipantVideo} 
                />
              ) : (
                <View style={styles.participantPlaceholder}>
                  <Image 
                    source={{ uri: participants[0]?.user?.avatar || 'https://via.placeholder.com/100' }} 
                    style={styles.mainParticipantAvatar} 
                  />
                </View>
              )}
              
              <View style={styles.participantInfo}>
                <Text style={styles.mainParticipantName}>
                  {participants[0]?.user?.name || 'User'}
                </Text>
                {participants[0]?.isMuted && (
                  <MicOff size={16} color="#ef4444" />
                )}
              </View>
            </View>
          )}
          
          {/* Small participants grid */}
          {participants.length > 1 && (
            <ScrollView 
              horizontal 
              style={styles.smallParticipantsContainer}
              showsHorizontalScrollIndicator={false}
            >
              {participants.slice(1).map((participant, index) => (
                <View key={participant.id} style={styles.smallParticipant}>
                  {participant?.isVideoOn ? (
                    <Image 
                      source={{ uri: participant?.user?.avatar || 'https://via.placeholder.com/100' }} 
                      style={styles.smallParticipantVideo} 
                    />
                  ) : (
                    <View style={styles.smallParticipantPlaceholder}>
                      <Image 
                        source={{ uri: participant?.user?.avatar || 'https://via.placeholder.com/50' }} 
                        style={styles.smallParticipantAvatar} 
                      />
                    </View>
                  )}
                  <Text style={styles.smallParticipantName} numberOfLines={1}>
                    {participant?.user?.name || `User ${index + 2}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlsRow}>
            {/* Mute Button */}
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={handleToggleMute}
            >
              {isMuted ? <MicOff size={24} color="white" /> : <Mic size={24} color="white" />}
            </TouchableOpacity>

            {/* Video Button */}
            <TouchableOpacity
              style={[styles.controlButton, !isVideoOn && styles.controlButtonActive]}
              onPress={handleToggleVideo}
            >
              {isVideoOn ? <Video size={24} color="white" /> : <VideoOff size={24} color="white" />}
            </TouchableOpacity>

            {/* Screen Share */}
            <TouchableOpacity
              style={[styles.controlButton, showScreenShare && styles.controlButtonActive]}
              onPress={() => setShowScreenShare(!showScreenShare)}
            >
              <Monitor size={24} color="white" />
            </TouchableOpacity>

            {/* Participants */}
            <TouchableOpacity
              style={[styles.controlButton, showParticipants && styles.controlButtonActive]}
              onPress={() => setShowParticipants(!showParticipants)}
            >
              <Users size={24} color="white" />
            </TouchableOpacity>

            {/* Chat */}
            <TouchableOpacity
              style={[styles.controlButton, showChat && styles.controlButtonActive]}
              onPress={() => setShowChat(!showChat)}
            >
              <MessageCircle size={24} color="white" />
            </TouchableOpacity>

            {/* More Options */}
            <TouchableOpacity
              style={[styles.controlButton, showMoreOptions && styles.controlButtonActive]}
              onPress={() => setShowMoreOptions(!showMoreOptions)}
            >
              <MoreHorizontal size={24} color="white" />
            </TouchableOpacity>

            {/* End Call */}
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
            >
              <PhoneOff size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Modal */}
        <Modal visible={showChat} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.chatModal}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatTitle}>Chat</Text>
                <TouchableOpacity onPress={() => setShowChat(false)}>
                  <X size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.chatMessages}>
                {chatMessages.map((message) => (
                  <View key={message.id} style={styles.chatMessage}>
                    <Text style={styles.chatSender}>{message.senderName}</Text>
                    <Text style={styles.chatText}>{message.message}</Text>
                    <Text style={styles.chatTime}>
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.chatInput}>
                <TextInput
                  style={styles.chatTextInput}
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="#666"
                  multiline
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                >
                  <Send size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ThemedLinearGradient>
    </SafeAreaView>
  );
}

const getQualityColor = (quality: 'excellent' | 'good' | 'poor') => {
  switch (quality) {
    case 'excellent': return '#4ade80';
    case 'good': return '#fbbf24';
    case 'poor': return '#ef4444';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  securityText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  qualityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  meetingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  meetingTime: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantCount: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  engagementScore: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  engagementText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  mainParticipantContainer: {
    flex: 1,
    position: 'relative',
  },
  mainParticipantVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  participantPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  mainParticipantAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  participantInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  mainParticipantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  smallParticipantsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    maxHeight: 160,
  },
  smallParticipant: {
    width: 80,
    height: 120,
    marginLeft: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  smallParticipantVideo: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  smallParticipantPlaceholder: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  smallParticipantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  smallParticipantName: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  bottomControls: {
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#ef4444',
  },
  endCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  chatModal: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 400,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  chatTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatMessage: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  chatSender: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  chatText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  chatTime: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 12,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Additional Advanced Modal Styles
  participantsModal: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    minHeight: 400,
  },
  moreOptionsModal: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '70%',
    minHeight: 350,
  },
  pollsModal: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    minHeight: 450,
  },
  createPollModal: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
    minHeight: 500,
  },
  aiInsightsModal: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    minHeight: 450,
  },
  summaryModal: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    minHeight: 600,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Participants List Styles
  participantsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  participantStatus: {
    color: '#9ca3af',
    fontSize: 14,
  },
  participantControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // More Options Styles
  optionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
    gap: 15,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // Polls Styles
  pollsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pollItem: {
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
  },
  pollQuestion: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  pollOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
  },
  pollOptionText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  pollVotes: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
  },
  // Create Poll Styles
  createPollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  pollQuestionInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 10,
  },
  pollOptionInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  removeOptionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    gap: 8,
  },
  addOptionText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  createPollButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 30,
    alignItems: 'center',
  },
  createPollButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  // AI Insights Styles
  aiInsightsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  insightCard: {
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
  },
  insightTitle: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  insightValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  insightDescription: {
    color: '#d1d5db',
    fontSize: 16,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  topicChip: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topicText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '500',
  },
  recommendationText: {
    color: '#d1d5db',
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 4,
  },
  // Enhanced Chat Modal Styles
  chatHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  chatActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(75, 85, 99, 0.5)',
  },
  chatMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  transcriptionEntry: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
  },
  transcriptionSpeaker: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  transcriptionText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  transcriptionConfidence: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 4,
  },
  // Video Layout Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
  // Speaker Layout
  speakerLayout: {
    flex: 1,
  },
  mainSpeaker: {
    flex: 1,
    position: 'relative',
  },
  speakerVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  speakerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
  },
  speakerAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  speakerName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  speakerInfo: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 10,
  },
  speakerNameOverlay: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  speakerThumbnails: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    maxHeight: 120,
  },
  thumbnail: {
    width: 70,
    height: 100,
    marginLeft: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  thumbnailVideo: {
    width: '100%',
    height: 70,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  thumbnailAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  thumbnailName: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    fontWeight: '500',
  },
  // Gallery Layout
  galleryContainer: {
    flex: 1,
    padding: 10,
  },
  galleryContent: {
    alignItems: 'center',
  },
  galleryParticipant: {
    aspectRatio: 1,
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  galleryVideo: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },
  galleryPlaceholder: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  galleryAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  galleryParticipantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  galleryParticipantName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  // Grid Layout
  gridLayout: {
    flex: 1,
  },
});
