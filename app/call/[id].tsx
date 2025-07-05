import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Video, MicOff, VideoOff, PhoneOff, Users, MessageCircle, Monitor, Settings, MoveHorizontal as MoreHorizontal, Hand, Camera, Volume2, Send, X, Share, UserPlus, Pause, Play, Square, UserX, Shuffle, Plus, CreditCard as Edit3, Trash2, ArrowRight, GraduationCap, Wifi, WifiOff, Battery, Clock, Maximize2, Minimize2, RotateCcw, FileText, Calendar, Filter, Search, ChevronDown, ChevronUp, Star, Flag, Download, Upload, Eye, EyeOff, Zap, Shield, Award, Target, Lightbulb, Timer, BarChart3, TrendingUp, Brain, Globe, Lock, Unlock, PaintBucket, Palette, Music, PlayCircle, StopCircle, FastForward, Rewind, SkipBack, SkipForward, Volume1, VolumeX, Headphones, Speaker } from 'lucide-react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { MeetingSummaryComponent } from '@/components/MeetingSummaryComponent';
import { apiService, MeetingDto, MeetingParticipantDto, UserDto, ActionItemDto, CallParticipant, ChatMessage, PollData, BreakoutRoom, MeetingAnalytics, TranscriptionEntry, CallStateUpdate } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function CallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user, ensureAuthenticated } = useAuth();
  
  // Meeting data and backend integration
  const [meeting, setMeeting] = useState<MeetingDto | null>(null);
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>([]);
  const [actionItems, setActionItems] = useState<ActionItemDto[]>([]);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(true);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  
  // Real-time call data
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [polls, setPolls] = useState<PollData[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [transcriptionEntries, setTranscriptionEntries] = useState<TranscriptionEntry[]>([]);
  const [meetingAnalytics, setMeetingAnalytics] = useState<MeetingAnalytics | null>(null);
  
  // Screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
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
    sentimentAnalysis: 'positive',
    keyTopics: ['Q1 Planning', 'Budget Review', 'Team Goals'],
    actionItems: 2,
    recommendations: [
      'Consider reducing meeting length by 10 minutes',
      'Schedule follow-up for budget discussion',
    ],
  });

  // Live transcription
  const [transcription, setTranscription] = useState([
    {
      id: '1',
      speaker: 'Emily Johnson',
      text: 'Welcome everyone to our Q1 planning meeting. Let\'s start with the agenda items.',
      timestamp: new Date(Date.now() - 30000),
      confidence: 0.95,
    },
    {
      id: '2',
      speaker: 'Jason Miller',
      text: 'Thanks Emily. I have the budget report ready to share.',
      timestamp: new Date(Date.now() - 15000),
      confidence: 0.88,
    },
  ]);

  // Polls and Q&A
  const [activePoll, setActivePoll] = useState<any>(null);

  // Breakout room creation states
  const [newRoomName, setNewRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('4');
  const [autoAssign, setAutoAssign] = useState(true);

  // Available participants for assignment
  const [availableParticipants] = useState([
    { id: '6', name: 'John Smith', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
    { id: '7', name: 'Anna Wilson', avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
    { id: '8', name: 'David Chen', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
  ]);

  // Mock meeting data for summary
  const [meetingData] = useState({
    id: id as string,
    title: 'Team Standup Meeting',
    startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    endTime: new Date(),
    totalDuration: 45,
    hostName: 'Emily Johnson',
    participants: [
      {
        id: '1',
        name: 'Emily Johnson',
        email: 'emily@company.com',
        joinTime: new Date(Date.now() - 45 * 60 * 1000),
        leaveTime: new Date(),
        totalDuration: 45,
        speakingTime: 12,
        cameraOnTime: 45,
        micOnTime: 43,
        messagesCount: 8,
        engagementScore: 92,
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      {
        id: '2',
        name: 'Jason Miller',
        email: 'jason@company.com',
        joinTime: new Date(Date.now() - 43 * 60 * 1000),
        leaveTime: new Date(),
        totalDuration: 43,
        speakingTime: 8,
        cameraOnTime: 40,
        micOnTime: 41,
        messagesCount: 5,
        engagementScore: 78,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      {
        id: '3',
        name: 'Megan Davis',
        email: 'megan@company.com',
        joinTime: new Date(Date.now() - 40 * 60 * 1000),
        leaveTime: new Date(),
        totalDuration: 40,
        speakingTime: 15,
        cameraOnTime: 38,
        micOnTime: 39,
        messagesCount: 12,
        engagementScore: 88,
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      {
        id: '4',
        name: 'Alex Thompson',
        email: 'alex@company.com',
        joinTime: new Date(Date.now() - 35 * 60 * 1000),
        leaveTime: new Date(),
        totalDuration: 35,
        speakingTime: 6,
        cameraOnTime: 30,
        micOnTime: 33,
        messagesCount: 3,
        engagementScore: 65,
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
    ],
    totalMessages: 28,
    recordingUrl: 'https://example.com/recording',
    transcriptUrl: 'https://example.com/transcript',
    keyTopics: [
      'Sprint planning for Q1',
      'Budget allocation discussion',
      'Team performance review',
      'New hiring requirements',
      'Client feedback analysis'
    ],
    actionItems: [
      'Finalize Q1 roadmap by Friday',
      'Schedule interviews for developer positions',
      'Prepare client presentation for next week',
      'Update project timeline documentation',
      'Review and approve marketing budget'
    ],
    decisions: [
      'Approved hiring of 2 additional developers',
      'Increased marketing budget by 15%',
      'Moved product launch to Q2',
      'Implemented new code review process'
    ],
    nextMeetingScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
  });

  // Mock participants data
  const participants = [
    {
      id: '1',
      name: 'Emily Johnson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isMuted: false,
      isVideoOn: true,
      isHost: true,
    },
    {
      id: '2',
      name: 'Jason Miller',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isMuted: true,
      isVideoOn: true,
      isHost: false,
    },
    {
      id: '3',
      name: 'Megan Davis',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isMuted: false,
      isVideoOn: false,
      isHost: false,
    },
    {
      id: '4',
      name: 'You',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isMuted: isMuted,
      isVideoOn: isVideoOn,
      isHost: false,
    },
  ];

  // Real meeting data and backend integration
  const [currentMeeting, setCurrentMeeting] = useState<MeetingDto | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [realParticipants, setRealParticipants] = useState<MeetingParticipantDto[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('connecting');

  // Backend integration for real meeting data
  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        if (id && typeof id === 'string') {
          // Try to get meeting by meeting ID first
          const meeting = await apiService.joinMeetingByMeetingId(id);
          setCurrentMeeting(meeting);
          setRealParticipants(meeting.participants || []);
          setCallStartTime(new Date());
          setConnectionStatus('connected');
          
          console.log('Successfully joined meeting:', meeting.title);
        }
      } catch (error) {
        console.error('Failed to fetch meeting data:', error);
        setConnectionStatus('failed');
        Alert.alert(
          'Meeting Error', 
          'Could not connect to the meeting. Please check your connection and try again.',
          [
            { text: 'Retry', onPress: () => fetchMeetingData() },
            { text: 'Leave', onPress: () => router.back() }
          ]
        );
      }
    };

    fetchMeetingData();
  }, [id]);

  // Real-time call duration tracking
  useEffect(() => {
    if (callStartTime && connectionStatus === 'connected') {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime.getTime()) / 1000);
        setCallDuration(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStartTime, connectionStatus]);

  // Real participants with backend data
  const participantsWithRealData = realParticipants.length > 0 
    ? realParticipants.map(participant => ({
        id: participant.id.toString(),
        name: participant.user.name,
        avatar: participant.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.user.name)}&background=random`,
        isMuted: Math.random() > 0.7, // Mock audio state
        isVideoOn: Math.random() > 0.3, // Mock video state
        isHost: participant.user.id === currentMeeting?.host.id,
      }))
    : participants; // Fall back to mock data if no real participants

  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Meeting',
      'Are you sure you want to end this meeting?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Meeting', 
          style: 'destructive',
          onPress: () => {
            // Show meeting summary before leaving
            setShowSummary(true);
          }
        },
      ]
    );
  };

  const handleSummaryClose = () => {
    setShowSummary(false);
    router.back();
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'You',
        message: chatMessage.trim(),
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const handleStartScreenShare = () => {
    setShowScreenShare(true);
    Alert.alert('Screen Share', 'Screen sharing started. Others can now see your screen.');
  };

  const handleStopScreenShare = () => {
    setShowScreenShare(false);
    Alert.alert('Screen Share', 'Screen sharing stopped.');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    Alert.alert('Recording Started', 'This meeting is now being recorded. All participants have been notified.');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    Alert.alert('Recording Stopped', 'Meeting recording has been saved and will be available shortly.');
  };

  const handleInviteParticipants = () => {
    Alert.alert('Invite Participants', 'Meeting link copied to clipboard:\nhttps://insync.app/join/abc-defg-hij');
  };

  const handleMuteAll = () => {
    Alert.alert('Mute All', 'All participants have been muted.');
  };

  const handleSettings = () => {
    Alert.alert('Meeting Settings', 'Configure audio, video, and meeting preferences.');
  };

  // Breakout room functions
  const handleCreateBreakoutRoom = () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    const newRoom = {
      id: Date.now().toString(),
      name: newRoomName,
      participants: autoAssign ? getRandomParticipants(parseInt(roomCapacity)) : [],
      isActive: true,
      capacity: parseInt(roomCapacity),
      createdAt: new Date(),
      topic: 'Discussion',
    };

    setBreakoutRooms(prev => [...prev, newRoom]);
    setNewRoomName('');
    setRoomCapacity('4');
    setShowCreateBreakout(false);
    
    Alert.alert(
      'Breakout Room Created', 
      `"${newRoom.name}" has been created successfully!${autoAssign ? ' Participants have been automatically assigned.' : ''}`
    );
  };

  const getRandomParticipants = (count: number) => {
    const shuffled = [...availableParticipants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  const handleJoinBreakoutRoom = (roomId: string, roomName: string) => {
    setCurrentBreakoutRoom(roomId);
    setIsInBreakoutRoom(true);
    setShowBreakoutRooms(false);
    setShowMoreOptions(false);
    
    Alert.alert(
      'Joined Breakout Room',
      `You have joined "${roomName}". You can return to the main room at any time.`,
      [
        { text: 'OK' },
        { text: 'Return to Main Room', onPress: handleReturnToMainRoom }
      ]
    );
  };

  const handleReturnToMainRoom = () => {
    setCurrentBreakoutRoom(null);
    setIsInBreakoutRoom(false);
    Alert.alert('Returned to Main Room', 'You have returned to the main meeting room.');
  };

  const handleDeleteBreakoutRoom = (roomId: string, roomName: string) => {
    Alert.alert(
      'Delete Breakout Room',
      `Are you sure you want to delete "${roomName}"? All participants will be returned to the main room.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBreakoutRooms(prev => prev.filter(room => room.id !== roomId));
            if (currentBreakoutRoom === roomId) {
              handleReturnToMainRoom();
            }
            Alert.alert('Room Deleted', `"${roomName}" has been deleted.`);
          }
        }
      ]
    );
  };

  const handleToggleRoomStatus = (roomId: string) => {
    setBreakoutRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, isActive: !room.isActive }
        : room
    ));
  };

  const handleAssignParticipant = (roomId: string, participant: any) => {
    setBreakoutRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: [...room.participants, participant] }
        : room
    ));
    Alert.alert('Participant Assigned', `${participant.name} has been assigned to the room.`);
  };

  const handleRemoveParticipant = (roomId: string, participantId: string) => {
    setBreakoutRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: room.participants.filter(p => p.id !== participantId) }
        : room
    ));
  };

  const handleBroadcastMessage = () => {
    Alert.alert(
      'Broadcast to All Rooms',
      'Send a message to all breakout rooms?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Message Sent', 'Your message has been broadcast to all breakout rooms.');
          }
        }
      ]
    );
  };

  const handleAutoAssignParticipants = () => {
    Alert.alert(
      'Auto-Assign Participants',
      'Automatically distribute all participants across active breakout rooms?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => {
            // Logic to auto-assign participants
            Alert.alert('Participants Assigned', 'All participants have been automatically distributed across breakout rooms.');
          }
        }
      ]
    );
  };

  const [showClassroomHub, setShowClassroomHub] = useState(false);

  // Advanced professional handlers
  const handleToggleAudioProcessing = (feature: keyof typeof audioProcessing) => {
    setAudioProcessing(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
    Alert.alert('Audio Settings', `${feature} ${audioProcessing[feature] ? 'disabled' : 'enabled'}`);
  };

  const handleToggleVideoEffect = (effect: keyof typeof videoEffects) => {
    setVideoEffects(prev => ({
      ...prev,
      [effect]: !prev[effect]
    }));
    Alert.alert('Video Effects', `${effect} ${videoEffects[effect] ? 'disabled' : 'enabled'}`);
  };

  const handleLayoutChange = (mode: 'grid' | 'speaker' | 'gallery') => {
    setLayoutMode(mode);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleFocusParticipant = (participantId: string) => {
    setFocusedParticipant(participantId === focusedParticipant ? null : participantId);
    setLayoutMode('speaker');
  };

  const handleToggleTranscription = () => {
    setShowTranscription(!showTranscription);
    if (!showTranscription) {
      // Simulate live transcription updates
      const interval = setInterval(() => {
        setTranscription(prev => [...prev, {
          id: Date.now().toString(),
          speaker: 'Live Speaker',
          text: 'This is a simulated live transcription...',
          timestamp: new Date(),
          confidence: 0.92,
        }]);
      }, 5000);
      
      setTimeout(() => clearInterval(interval), 30000);
    }
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    const newPoll = {
      id: Date.now().toString(),
      question,
      options: options.map((text, index) => ({
        id: String.fromCharCode(97 + index),
        text,
        votes: 0,
      })),
      isActive: true,
      createdBy: 'You',
    };
    setPolls(prev => [...prev, newPoll]);
    setActivePoll(newPoll);
    Alert.alert('Poll Created', 'Your poll has been shared with all participants.');
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? {
            ...poll,
            options: poll.options.map(option =>
              option.id === optionId
                ? { ...option, votes: option.votes + 1 }
                : option
            )
          }
        : poll
    ));
  };

  const handleSendReaction = (reaction: string) => {
    setShowReactions(true);
    // Animate reaction
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => setShowReactions(false), 2000);
  };

  const handleNetworkDiagnostics = () => {
    setShowNetworkStats(!showNetworkStats);
    // Simulate network stats update
    const updateStats = () => {
      setNetworkStats({
        bandwidth: 2.1 + Math.random() * 0.8,
        latency: 40 + Math.random() * 20,
        packetLoss: Math.random() * 0.5,
        jitter: 10 + Math.random() * 10,
      });
    };
    
    const interval = setInterval(updateStats, 2000);
    setTimeout(() => clearInterval(interval), 20000);
  };

  const handleAiInsights = () => {
    setShowAiInsights(!showAiInsights);
    // Update AI insights
    setAiInsights(prev => ({
      ...prev,
      engagementScore: 80 + Math.random() * 20,
      talkTime: {
        user: prev.talkTime.user + 1,
        total: prev.talkTime.total + 1,
      },
    }));
  };

  const handleExportMeetingData = () => {
    Alert.alert(
      'Export Meeting Data',
      'Choose export format:',
      [
        { text: 'PDF Report', onPress: () => Alert.alert('Export', 'PDF report generated successfully!') },
        { text: 'Excel Analytics', onPress: () => Alert.alert('Export', 'Excel file with analytics exported!') },
        { text: 'Video Recording', onPress: () => Alert.alert('Export', 'Video recording will be available shortly!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      'Security Settings',
      'Manage meeting security options:',
      [
        { 
          text: 'Toggle Waiting Room', 
          onPress: () => {
            setMeetingSecurity(prev => ({ ...prev, waitingRoom: !prev.waitingRoom }));
            Alert.alert('Security', `Waiting room ${meetingSecurity.waitingRoom ? 'disabled' : 'enabled'}`);
          }
        },
        { 
          text: 'End-to-End Encryption', 
          onPress: () => Alert.alert('Security', 'End-to-end encryption is active and cannot be disabled during the meeting.')
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Network quality monitoring
  useEffect(() => {
    const checkNetworkQuality = () => {
      const { bandwidth, latency, packetLoss } = networkStats;
      if (bandwidth < 1.0 || latency > 150 || packetLoss > 3) {
        setConnectionQuality('poor');
      } else if (bandwidth < 2.0 || latency > 100 || packetLoss > 1) {
        setConnectionQuality('good');
      } else {
        setConnectionQuality('excellent');
      }
    };

    const interval = setInterval(checkNetworkQuality, 5000);
    return () => clearInterval(interval);
  }, [networkStats]);

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.googleMeetSafeArea}>
        {/* Minimal Header - Top Left User Info */}
        <View style={styles.googleMeetHeader}>
          <View style={styles.participantInfoHeader}>
            <View style={styles.participantAvatarContainer}>
              <Text style={styles.participantInitial}>K</Text>
            </View>
            <View style={styles.participantDetails}>
              <Text style={styles.participantNameHeader} numberOfLines={1}>
                kelvinkissieduagyei@...
              </Text>
            </View>
            <TouchableOpacity style={styles.expandButton}>
              <ChevronDown color="#ffffff" size={16} />
            </TouchableOpacity>
          </View>

          {/* Top Right Controls */}
          <View style={styles.topRightControls}>
            <TouchableOpacity style={styles.topControlButton}>
              <Monitor color="#ffffff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topControlButton}>
              <Volume2 color="#ffffff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Video Area */}
        <View style={styles.googleMeetVideoArea}>
          {/* Main Participant (full screen) */}
          <View style={styles.mainParticipantTile}>
            {participants[0]?.isVideoOn ? (
              <Image source={{ uri: participants[0]?.avatar }} style={styles.googleMeetParticipantVideo} />
            ) : (
              <View style={styles.googleMeetVideoOffContainer}>
                <Image source={{ uri: participants[0]?.avatar }} style={styles.googleMeetParticipantAvatar} />
              </View>
            )}
            
            {/* Main participant name at bottom */}
            <View style={styles.mainParticipantNameContainer}>
              <Text style={styles.mainParticipantName}>{participants[0]?.name || 'Kelvin'}</Text>
              <TouchableOpacity style={styles.participantOptionsButton}>
                <MoreHorizontal color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Small participant in bottom-right corner (Picture-in-Picture) */}
          {participants.length > 1 && (
            <View style={styles.smallParticipantTile}>
              {participants[1]?.isVideoOn ? (
                <Image source={{ uri: participants[1]?.avatar }} style={styles.googleMeetParticipantVideo} />
              ) : (
                <View style={styles.googleMeetVideoOffContainer}>
                  <Image source={{ uri: participants[1]?.avatar }} style={styles.smallParticipantAvatar} />
                </View>
              )}
              
              {/* Small participant controls */}
              <View style={styles.smallParticipantContainer}>
                <TouchableOpacity style={styles.smallParticipantOptions}>
                  <Monitor color="#ffffff" size={12} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallParticipantMoreOptions}>
                  <MoreHorizontal color="#ffffff" size={12} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Google Meet Style Bottom Controls */}
        <View style={styles.googleMeetBottomControls}>
          <View style={styles.googleMeetControlsRow}>
            {/* Mic Button */}
            <TouchableOpacity 
              style={[styles.googleMeetControlButton, isMuted && styles.googleMeetControlButtonMuted]}
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <MicOff color="#ffffff" size={24} />
              ) : (
                <Mic color="#ffffff" size={24} />
              )}
            </TouchableOpacity>

            {/* Video Button */}
            <TouchableOpacity 
              style={[styles.googleMeetControlButton, !isVideoOn && styles.googleMeetControlButtonMuted]}
              onPress={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? (
                <Video color="#ffffff" size={24} />
              ) : (
                <VideoOff color="#ffffff" size={24} />
              )}
            </TouchableOpacity>

            {/* Reaction Button */}
            <TouchableOpacity 
              style={styles.googleMeetControlButton}
              onPress={() => handleSendReaction('👍')}
            >
              <Text style={styles.reactionButtonText}>😊</Text>
            </TouchableOpacity>

            {/* More Options Button */}
            <TouchableOpacity 
              style={styles.googleMeetControlButton}
              onPress={() => setShowMoreOptions(!showMoreOptions)}
            >
              <MoreHorizontal color="#ffffff" size={24} />
            </TouchableOpacity>

            {/* End Call Button - Red */}
            <TouchableOpacity 
              style={styles.googleMeetEndCallButton}
              onPress={handleEndCall}
            >
              <PhoneOff color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Reactions Overlay */}
        {showReactions && (
          <Animated.View style={[styles.reactionsOverlay, { opacity: fadeAnim }]}>
            <Text style={styles.reactionEmoji}>👍</Text>
          </Animated.View>
        )}
      </SafeAreaView>

      {/* More Options Modal */}
      <Modal
        visible={showMoreOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreOptions(false)}
      >
        <View style={styles.moreOptionsOverlay}>
          <View style={styles.moreOptionsPanel}>
            <View style={styles.moreOptionsHeader}>
              <Text style={styles.moreOptionsTitle}>More Options</Text>
              <TouchableOpacity onPress={() => setShowMoreOptions(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.moreOptionsList}>
              <TouchableOpacity style={styles.moreOption} onPress={() => setShowChat(true)}>
                <MessageCircle size={24} color={theme.colors.primary} />
                <Text style={styles.moreOptionText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreOption} onPress={() => setShowParticipants(true)}>
                <Users size={24} color={theme.colors.primary} />
                <Text style={styles.moreOptionText}>Participants</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreOption} onPress={() => setShowScreenShare(true)}>
                <Monitor size={24} color={theme.colors.primary} />
                <Text style={styles.moreOptionText}>Share Screen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreOption} onPress={() => setIsRecording(!isRecording)}>
                <Square size={24} color={isRecording ? theme.colors.error : theme.colors.primary} />
                <Text style={styles.moreOptionText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Panel */}
      <Modal
        visible={showChat}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChat(false)}
      >
        <View style={styles.chatOverlay}>
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Meeting Chat</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
              {chatMessages.map((message) => (
                <View key={message.id} style={styles.chatMessage}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageSender}>{message.sender}</Text>
                    <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
                  </View>
                  <Text style={styles.messageText}>{message.message}</Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.chatInput}>
              <TextInput
                style={styles.messageInput}
                value={chatMessage}
                onChangeText={setChatMessage}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Send size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Participants Panel */}
      <Modal
        visible={showParticipants}
        transparent
        animationType="slide"
        onRequestClose={() => setShowParticipants(false)}
      >
        <View style={styles.participantsOverlay}>
          <View style={styles.participantsPanel}>
            <View style={styles.participantsHeader}>
              <Text style={styles.participantsTitle}>Participants ({participants.length})</Text>
              <View style={styles.participantsActions}>
                <TouchableOpacity style={styles.participantAction} onPress={handleInviteParticipants}>
                  <UserPlus size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.participantAction} onPress={handleMuteAll}>
                  <MicOff size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowParticipants(false)}>
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.participantsList} showsVerticalScrollIndicator={false}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                  <View style={styles.participantDetails}>
                    <Text style={styles.participantItemName}>{participant.name}</Text>
                    {participant.isHost && (
                      <Text style={styles.participantRole}>Host</Text>
                    )}
                  </View>
                  <View style={styles.participantStatus}>
                    {!participant.isMuted && (
                      <Mic size={16} color={theme.colors.success} />
                    )}
                    {participant.isVideoOn && (
                      <Video size={16} color={theme.colors.success} />
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedLinearGradient>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 50, // Increased spacing from status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  callInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  callTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  callDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  recordingText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  returnButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  settingsButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  videoTile: {
    width: '48%',
    aspectRatio: 4/3,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  participantVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOffContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  participantOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 2,
  },
  hostBadge: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#4FC3F7',
  },
  participantControls: {
    flexDirection: 'row',
    gap: 4,
  },
  micIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 10,
    padding: 4,
  },
  micMuted: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  // Google Meet Style Controls
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
  },
  primaryControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetingInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea4335',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  recordingPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  recordingBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 2,
    justifyContent: 'center',
  },
  googleMeetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface === '#1a1a1a' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(60, 64, 67, 0.1)',
    borderRadius: 24,
    padding: 2,
    minWidth: 48,
    height: 48,
  },
  googleMeetButtonDanger: {
    backgroundColor: '#ea4335',
  },
  googleMeetButtonActive: {
    backgroundColor: '#1a73e8',
  },
  buttonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  buttonInnerMuted: {
    opacity: 1,
  },
  buttonInnerActive: {
    opacity: 1,
  },
  buttonDropdown: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonDropdownDanger: {
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonDropdownActive: {
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  googleMeetEndCall: {
    backgroundColor: '#ea4335',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ea4335',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  googleMeetMoreButton: {
    backgroundColor: theme.colors.surface === '#1a1a1a' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(60, 64, 67, 0.1)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  googleMeetSmallButton: {
    backgroundColor: theme.colors.surface === '#1a1a1a' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(60, 64, 67, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  googleMeetSmallButtonActive: {
    backgroundColor: 'rgba(26, 115, 232, 0.2)',
  },
  smallButtonText: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: theme.colors.surface === '#1a1a1a' ? '#ffffff' : '#3c4043',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: theme.colors.surface === '#1a1a1a' ? '#000000' : '#ffffff',
    minWidth: 16,
    textAlign: 'center',
  },
  smallButtonTextActive: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
  },
  secondaryControlBar: {
    alignItems: 'center',
  },
  secondaryScrollContent: {
    paddingHorizontal: 0,
    gap: 8,
  },
  googleMeetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface === '#1a1a1a' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(60, 64, 67, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  googleMeetChipActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.surface === '#1a1a1a' ? '#ffffff' : '#3c4043',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  // Google Meet Video Grid Styles
  googleMeetVideoGrid: {
    flex: 1,
    backgroundColor: '#202124',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 120, // Space for controls
  },
  speakerLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  mainSpeakerContainer: {
    flex: 1,
    marginBottom: 8,
  },
  mainSpeakerTile: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3c4043',
    position: 'relative',
  },
  mainSpeakerVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  speakerVideoOff: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c4043',
  },
  speakerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  speakerName: {
    fontSize: 24,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    textAlign: 'center',
  },
  speakerOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speakerInfo: {
    flex: 1,
  },
  speakerNameText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 4,
  },
  speakerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakingIndicator: {
    backgroundColor: 'rgba(26, 115, 232, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speakingPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    height: 90,
    gap: 8,
  },
  thumbnailTile: {
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3c4043',
    position: 'relative',
  },
  thumbnailVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailVideoOff: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c4043',
  },
  thumbnailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thumbnailName: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    flex: 1,
  },
  thumbnailMicIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderRadius: 6,
    padding: 2,
  },
  gridLayout: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignContent: 'center',
  },
  googleMeetVideoTile: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3c4043',
    position: 'relative',
  },
  singleParticipantTile: {
    width: '100%',
    height: '100%',
  },
  twoParticipantTile: {
    width: '48%',
    aspectRatio: 16/9,
  },
  fourParticipantTile: {
    width: '48%',
    aspectRatio: 4/3,
  },
  googleMeetVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  googleMeetVideoOff: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c4043',
  },
  googleMeetAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  googleMeetOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  participantNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  googleMeetParticipantName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    flex: 1,
  },
  googleMeetHostBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hostBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  googleMeetParticipantControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  googleMeetSpeakingIndicator: {
    backgroundColor: 'rgba(26, 115, 232, 0.8)',
    borderRadius: 8,
    padding: 4,
  },
  speakingAnimation: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  googleMeetMutedIndicator: {
    backgroundColor: 'rgba(234, 67, 53, 0.8)',
    borderRadius: 8,
    padding: 4,
  },
  videoOnIndicator: {
    backgroundColor: 'rgba(52, 168, 83, 0.8)',
    borderRadius: 6,
    padding: 2,
  },
  connectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  // Legacy secondary button styles
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
  },
  secondaryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  secondaryButtonTextActive: {
    color: '#ffffff',
  },
  // Chat styles
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatPanel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    paddingTop: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  chatTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chatMessage: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Participants styles
  participantsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  participantsPanel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    paddingTop: 20,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  participantsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  participantsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantAction: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 8,
  },
  participantsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantItemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.primary,
  },
  participantStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  // More options styles
  moreOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  moreOptionsPanel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  moreOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  moreOptionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  moreOptionsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  moreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  moreOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    flex: 1,
  },
  roomCountBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  // Enhanced Breakout rooms styles
  breakoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  breakoutPanel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 20,
  },
  breakoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  breakoutTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  breakoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakoutAction: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 8,
  },
  breakoutList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  breakoutRoom: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomInfo: {
    flex: 1,
    marginRight: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    flex: 1,
  },
  roomStatusContainer: {
    marginLeft: 8,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  roomTopic: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  roomCapacity: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  roomParticipants: {
    marginTop: 8,
  },
  participantsLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantMiniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  moreParticipants: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreParticipantsText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  roomActions: {
    alignItems: 'center',
    gap: 8,
  },
  joinRoomButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
  },
  joinRoomButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  joinRoomText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
  },
  joinRoomTextDisabled: {
    color: theme.colors.textSecondary,
  },
  deleteRoomButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyRooms: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyRoomsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRoomsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  breakoutFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  createRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createRoomText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: theme.colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  createButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  // Enhanced header styles
  titleSection: {
    alignItems: 'flex-start',
  },
  securityIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  encryptionText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#4CAF50',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  networkText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  participantCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  participantCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  engagementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  // Advanced control styles
  advancedControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  advancedButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  advancedButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
  },
  advancedButtonTextActive: {
    color: '#ffffff',
  },
  // AI Insights Panel styles
  aiInsightsPanel: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  aiInsightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiInsightsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  insightMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  insightValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  // Network Stats Panel styles
  networkStatsPanel: {
    position: 'absolute',
    top: 80,
    left: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  // Live reactions overlay
  reactionsOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 1000,
  },
  reactionEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  // Google Meet Main Container & Layout
  googleMeetContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  googleMeetSafeArea: {
    flex: 1,
  },
  googleMeetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Increased spacing from status bar
    marginBottom: 10, // Add spacing between header and video
  },
  participantInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34a853',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  participantInitial: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  participantNameHeader: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    flex: 1,
  },
  expandButton: {
    padding: 4,
    marginLeft: 4,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Google Meet Video Area
  googleMeetVideoArea: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 120,
  },
  googleMeetParticipantTile: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3c4043',
  },
  mainParticipantTile: {
    top: 2, // Reduced since header now has proper spacing
    left: 8,
    right: 8,
    bottom: 0,
  },
  smallParticipantTile: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3c4043',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  googleMeetParticipantVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  googleMeetVideoOffContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c4043',
  },
  googleMeetParticipantAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  smallParticipantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  mainParticipantNameContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainParticipantName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    backgroundColor: 'rgba(32, 33, 36, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginRight: 8,
    textAlign: 'left',
  },
  participantOptionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(32, 33, 36, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallParticipantContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  smallParticipantOptions: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallParticipantMoreOptions: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Google Meet Bottom Controls
  googleMeetBottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(32, 33, 36, 0.95)',
  },
  googleMeetControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  googleMeetControlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(95, 99, 104, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  googleMeetControlButtonMuted: {
    backgroundColor: '#ea4335',
  },
  googleMeetEndCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ea4335',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ea4335',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reactionButtonText: {
    fontSize: 28,
  },
});