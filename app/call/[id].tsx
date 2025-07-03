import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Video, MicOff, VideoOff, PhoneOff, Users, MessageCircle, Monitor, Settings, MoveHorizontal as MoreHorizontal, Hand, Camera, Volume2, Send, X, Share, UserPlus, Pause, Play, Square, UserX, Shuffle, Plus, CreditCard as Edit3, Trash2, ArrowRight, GraduationCap } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { MeetingSummaryComponent } from '@/components/MeetingSummaryComponent';

export default function CallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  
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

  // Breakout room creation states
  const [newRoomName, setNewRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('4');
  const [autoAssign, setAutoAssign] = useState(true);

  // Chat messages
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'Emily Johnson',
      message: 'Welcome everyone! Let\'s start with our agenda.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: '2',
      sender: 'Jason Miller',
      message: 'Thanks for organizing this meeting.',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
    },
    {
      id: '3',
      sender: 'Megan Davis',
      message: 'I have the Q1 report ready to share.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
  ]);

  // Breakout rooms data with enhanced functionality
  const [breakoutRooms, setBreakoutRooms] = useState([
    {
      id: '1',
      name: 'Design Team',
      participants: [
        { id: '1', name: 'Sarah Wilson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
        { id: '2', name: 'Mike Johnson', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }
      ],
      isActive: true,
      capacity: 4,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      topic: 'UI/UX Design Review',
    },
    {
      id: '2',
      name: 'Development Team',
      participants: [
        { id: '3', name: 'Emma Davis', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
        { id: '4', name: 'Alex Thompson', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }
      ],
      isActive: true,
      capacity: 4,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      topic: 'Sprint Planning',
    },
    {
      id: '3',
      name: 'Marketing Team',
      participants: [
        { id: '5', name: 'Lisa Brown', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }
      ],
      isActive: false,
      capacity: 3,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      topic: 'Campaign Strategy',
    },
  ]);

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

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.callInfo}>
            <Text style={styles.callTitle}>
              {isInBreakoutRoom 
                ? `Breakout: ${breakoutRooms.find(r => r.id === currentBreakoutRoom)?.name || 'Room'}`
                : 'Team Standup'
              }
            </Text>
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {isInBreakoutRoom && (
              <TouchableOpacity style={styles.returnButton} onPress={handleReturnToMainRoom}>
                <ArrowRight color="#ffffff" size={16} />
                <Text style={styles.returnButtonText}>Main Room</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <Settings color={theme.colors.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Grid */}
        <View style={styles.videoGrid}>
          {participants.map((participant) => (
            <View key={participant.id} style={styles.videoTile}>
              {participant.isVideoOn ? (
                <Image source={{ uri: participant.avatar }} style={styles.participantVideo} />
              ) : (
                <View style={styles.videoOffContainer}>
                  <Image source={{ uri: participant.avatar }} style={styles.avatarImage} />
                  <VideoOff color={theme.colors.textSecondary} size={24} />
                </View>
              )}
              
              <View style={styles.participantOverlay}>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  {participant.isHost && (
                    <Text style={styles.hostBadge}>Host</Text>
                  )}
                </View>
                <View style={styles.participantControls}>
                  {!participant.isMuted ? (
                    <View style={styles.micIndicator}>
                      <Mic color="#4CAF50" size={12} />
                    </View>
                  ) : (
                    <View style={[styles.micIndicator, styles.micMuted]}>
                      <MicOff color="#F44336" size={12} />
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.primaryControls}>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.controlButtonMuted]} 
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <MicOff color="#ffffff" size={28} />
              ) : (
                <Mic color={theme.colors.text} size={28} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, !isVideoOn && styles.controlButtonMuted]} 
              onPress={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? (
                <Video color={theme.colors.text} size={28} />
              ) : (
                <VideoOff color="#ffffff" size={28} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.endCallButton} 
              onPress={handleEndCall}
            >
              <PhoneOff color="#ffffff" size={32} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]} 
              onPress={() => setIsSpeakerOn(!isSpeakerOn)}
            >
              <Volume2 color={isSpeakerOn ? "#ffffff" : theme.colors.text} size={28} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, showChat && styles.controlButtonActive]}
              onPress={() => setShowChat(!showChat)}
            >
              <MessageCircle color={showChat ? "#ffffff" : theme.colors.text} size={28} />
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryControls}>
            <TouchableOpacity 
              style={[styles.secondaryButton, isHandRaised && styles.secondaryButtonActive]}
              onPress={() => setIsHandRaised(!isHandRaised)}
            >
              <Hand color={isHandRaised ? "#ffffff" : theme.colors.text} size={18} />
              <Text style={[styles.secondaryButtonText, isHandRaised && styles.secondaryButtonTextActive]}>
                {isHandRaised ? 'Lower' : 'Raise'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, showParticipants && styles.secondaryButtonActive]}
              onPress={() => setShowParticipants(!showParticipants)}
            >
              <Users color={showParticipants ? "#ffffff" : theme.colors.text} size={18} />
              <Text style={[styles.secondaryButtonText, showParticipants && styles.secondaryButtonTextActive]}>
                {participants.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, showScreenShare && styles.secondaryButtonActive]}
              onPress={showScreenShare ? handleStopScreenShare : handleStartScreenShare}
            >
              <Monitor color={showScreenShare ? "#ffffff" : theme.colors.text} size={18} />
              <Text style={[styles.secondaryButtonText, showScreenShare && styles.secondaryButtonTextActive]}>
                {showScreenShare ? 'Stop' : 'Share'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
            >
              {isRecording ? (
                <Square color="#ffffff" size={16} />
              ) : (
                <Camera color={theme.colors.text} size={18} />
              )}
              <Text style={[styles.secondaryButtonText, isRecording && styles.secondaryButtonTextActive]}>
                {isRecording ? 'Stop' : 'Record'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, showMoreOptions && styles.secondaryButtonActive]}
              onPress={() => setShowMoreOptions(!showMoreOptions)}
            >
              <MoreHorizontal color={showMoreOptions ? "#ffffff" : theme.colors.text} size={18} />
              <Text style={[styles.secondaryButtonText, showMoreOptions && styles.secondaryButtonTextActive]}>
                More
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, showClassroomHub && styles.secondaryButtonActive]}
              onPress={() => setShowClassroomHub(true)}
            >
              <GraduationCap color={showClassroomHub ? "#ffffff" : theme.colors.text} size={18} />
              <Text style={[styles.secondaryButtonText, showClassroomHub && styles.secondaryButtonTextActive]}>
                Classroom
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {/* More Options Panel */}
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
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.moreOptionsList}>
                <TouchableOpacity style={styles.moreOption} onPress={handleInviteParticipants}>
                  <Share size={20} color={theme.colors.primary} />
                  <Text style={styles.moreOptionText}>Share Meeting Link</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.moreOption} onPress={() => setShowBreakoutRooms(true)}>
                  <Shuffle size={20} color={theme.colors.primary} />
                  <Text style={styles.moreOptionText}>Breakout Rooms</Text>
                  <View style={styles.roomCountBadge}>
                    <Text style={styles.roomCountText}>{breakoutRooms.filter(r => r.isActive).length}</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.moreOption} onPress={handleMuteAll}>
                  <MicOff size={20} color={theme.colors.primary} />
                  <Text style={styles.moreOptionText}>Mute All Participants</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.moreOption} 
                  onPress={isRecording ? handleStopRecording : handleStartRecording}
                >
                  {isRecording ? (
                    <Square size={20} color={theme.colors.error} />
                  ) : (
                    <Camera size={20} color={theme.colors.primary} />
                  )}
                  <Text style={styles.moreOptionText}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.moreOption} onPress={handleSettings}>
                  <Settings size={20} color={theme.colors.primary} />
                  <Text style={styles.moreOptionText}>Meeting Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Enhanced Breakout Rooms Panel */}
        <Modal
          visible={showBreakoutRooms}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBreakoutRooms(false)}
        >
          <View style={styles.breakoutOverlay}>
            <View style={styles.breakoutPanel}>
              <View style={styles.breakoutHeader}>
                <Text style={styles.breakoutTitle}>Breakout Rooms ({breakoutRooms.length})</Text>
                <View style={styles.breakoutActions}>
                  <TouchableOpacity style={styles.breakoutAction} onPress={() => setShowCreateBreakout(true)}>
                    <Plus size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.breakoutAction} onPress={handleAutoAssignParticipants}>
                    <Shuffle size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.breakoutAction} onPress={handleBroadcastMessage}>
                    <MessageCircle size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowBreakoutRooms(false)}>
                    <X size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView style={styles.breakoutList} showsVerticalScrollIndicator={false}>
                {breakoutRooms.map((room) => (
                  <View key={room.id} style={styles.breakoutRoom}>
                    <View style={styles.roomInfo}>
                      <View style={styles.roomHeader}>
                        <Text style={styles.roomName}>{room.name}</Text>
                        <View style={styles.roomStatusContainer}>
                          <TouchableOpacity 
                            style={styles.statusToggle}
                            onPress={() => handleToggleRoomStatus(room.id)}
                          >
                            <View style={[styles.statusDot, { backgroundColor: room.isActive ? theme.colors.success : theme.colors.textTertiary }]} />
                            <Text style={styles.statusText}>{room.isActive ? 'Active' : 'Inactive'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <Text style={styles.roomTopic}>Topic: {room.topic}</Text>
                      <Text style={styles.roomCapacity}>
                        {room.participants.length}/{room.capacity} participants
                      </Text>
                      
                      {room.participants.length > 0 && (
                        <View style={styles.roomParticipants}>
                          <Text style={styles.participantsLabel}>Participants:</Text>
                          <View style={styles.participantAvatars}>
                            {room.participants.slice(0, 3).map((participant) => (
                              <Image 
                                key={participant.id} 
                                source={{ uri: participant.avatar }} 
                                style={styles.participantMiniAvatar} 
                              />
                            ))}
                            {room.participants.length > 3 && (
                              <View style={styles.moreParticipants}>
                                <Text style={styles.moreParticipantsText}>+{room.participants.length - 3}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.roomActions}>
                      <TouchableOpacity 
                        style={[styles.joinRoomButton, !room.isActive && styles.joinRoomButtonDisabled]}
                        onPress={() => room.isActive && handleJoinBreakoutRoom(room.id, room.name)}
                        disabled={!room.isActive}
                      >
                        <Text style={[styles.joinRoomText, !room.isActive && styles.joinRoomTextDisabled]}>
                          Join
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteRoomButton}
                        onPress={() => handleDeleteBreakoutRoom(room.id, room.name)}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                {breakoutRooms.length === 0 && (
                  <View style={styles.emptyRooms}>
                    <Shuffle size={48} color={theme.colors.textTertiary} />
                    <Text style={styles.emptyRoomsText}>No breakout rooms created yet</Text>
                    <Text style={styles.emptyRoomsSubtext}>Create rooms to enable small group discussions</Text>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.breakoutFooter}>
                <TouchableOpacity style={styles.createRoomButton} onPress={() => setShowCreateBreakout(true)}>
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.createRoomText}>Create New Room</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Create Breakout Room Modal */}
        <Modal
          visible={showCreateBreakout}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreateBreakout(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Breakout Room</Text>
                <TouchableOpacity onPress={() => setShowCreateBreakout(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Room Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRoomName}
                    onChangeText={setNewRoomName}
                    placeholder="Enter room name"
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Capacity</Text>
                  <TextInput
                    style={styles.textInput}
                    value={roomCapacity}
                    onChangeText={setRoomCapacity}
                    placeholder="Maximum participants"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.switchGroup}>
                  <Text style={styles.switchLabel}>Auto-assign participants</Text>
                  <TouchableOpacity 
                    style={[styles.switch, autoAssign && styles.switchActive]}
                    onPress={() => setAutoAssign(!autoAssign)}
                  >
                    <View style={[styles.switchThumb, autoAssign && styles.switchThumbActive]} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowCreateBreakout(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={handleCreateBreakoutRoom}
                  >
                    <Text style={styles.createButtonText}>Create Room</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Meeting Summary Modal */}
        <MeetingSummaryComponent
          visible={showSummary}
          onClose={handleSummaryClose}
          meetingData={meetingData}
        />

        {/* Classroom Hub Modal */}
        <Modal
          visible={showClassroomHub}
          transparent
          animationType="slide"
          onRequestClose={() => setShowClassroomHub(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Virtual Classroom</Text>
                <TouchableOpacity onPress={() => setShowClassroomHub(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 40 }}>
                  All your advanced tools (whiteboard, notes, polls, breakouts, etc.) will be accessible here!
                </Text>
              </View>
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
    paddingTop: 20, // Bring down from status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 10,
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
    marginBottom: 8,
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
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButtonMuted: {
    backgroundColor: '#F44336',
    borderColor: '#D32F2F',
  },
  controlButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#D32F2F',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
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
});