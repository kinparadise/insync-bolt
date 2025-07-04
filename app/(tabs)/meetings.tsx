import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, TextInput, Modal, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, Video, Plus, Hash, Play, Settings, FileText, X, Copy, CalendarDays, Search, Filter, Edit3, Trash2, Share, TrendingUp, Timer, Briefcase, GraduationCap, MessageCircle, Target, Eye, BarChart3 } from 'lucide-react-native';
import { useState } from 'react';
import { useRef, useEffect } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/contexts/AuthContext';
import { CreateMeetingModal } from '@/components/CreateMeetingModal';
import CalendarPickerModal from '@/components/CalendarPickerModal';
import { MeetingDto, apiService } from '@/services/api';

export default function MeetingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: deviceHeight } = Dimensions.get('window');
  const usableHeight = deviceHeight - insets.top - insets.bottom;
  
  const { meetings, upcomingMeetings, isLoading, error, fetchMeetings, joinMeeting, createInstantMeeting, joinMeetingByMeetingId } = useMeetings();
  const { diagnoseAuth } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedMeetingForCalendar, setSelectedMeetingForCalendar] = useState<MeetingDto | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'GENERAL' | 'CLASSROOM' | 'BUSINESS' | 'ONE_ON_ONE'>('all');
  
  // Animation values
  const quickActionsHeight = useRef(new Animated.Value(1)).current;
  const quickActionsOpacity = useRef(new Animated.Value(1)).current;

  // Meeting templates with enhanced design
  const meetingTemplates = [
    {
      id: 'daily-standup',
      name: 'Daily Standup',
      description: 'Quick 15-minute sync for team alignment and progress updates',
      duration: 15,
      type: 'BUSINESS',
      icon: Target,
      color: '#10B981',
      participants: '3-8 people',
      category: 'Team Sync',
    },
    {
      id: 'one-on-one',
      name: 'One-on-One',
      description: 'Private discussion for feedback, goals, and personal development',
      duration: 30,
      type: 'ONE_ON_ONE',
      icon: MessageCircle,
      color: '#8B5CF6',
      participants: '2 people',
      category: 'Performance',
    },
    {
      id: 'project-review',
      name: 'Project Review',
      description: 'Comprehensive review of project deliverables and milestones',
      duration: 60,
      type: 'BUSINESS',
      icon: BarChart3,
      color: '#F59E0B',
      participants: '4-10 people',
      category: 'Project Management',
    },
    {
      id: 'training-session',
      name: 'Training Session',
      description: 'Educational workshop for skill development and knowledge sharing',
      duration: 90,
      type: 'CLASSROOM',
      icon: GraduationCap,
      color: '#3B82F6',
      participants: '5-20 people',
      category: 'Learning',
    },
    {
      id: 'team-retrospective',
      name: 'Team Retrospective',
      description: 'Reflect on past sprint performance and identify improvements',
      duration: 45,
      type: 'BUSINESS',
      icon: Eye,
      color: '#EF4444',
      participants: '3-12 people',
      category: 'Agile',
    },
    {
      id: 'client-presentation',
      name: 'Client Presentation',
      description: 'Professional presentation of project updates to stakeholders',
      duration: 60,
      type: 'BUSINESS',
      icon: Briefcase,
      color: '#06B6D4',
      participants: '2-15 people',
      category: 'Client Relations',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMeetingTypeColor = (type: MeetingDto['type']) => {
    switch (type) {
      case 'CLASSROOM':
        return theme.colors.success;
      case 'BUSINESS':
        return theme.colors.warning;
      case 'ONE_ON_ONE':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getMeetingStatusColor = (status: MeetingDto['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return theme.colors.success;
      case 'COMPLETED':
        return theme.colors.textSecondary;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const handleJoinMeeting = async (meeting: MeetingDto) => {
    try {
      console.log('Attempting to join meeting:', meeting.id, meeting.meetingId);
      await joinMeeting(meeting.id);
      router.push(`/call/${meeting.meetingId}` as any);
    } catch (error) {
      console.error('Failed to join meeting:', error);
      
      // Run diagnosis to help understand the issue
      const diagnosis = await diagnoseAuth();
      
      Alert.alert(
        'Failed to Join Meeting', 
        error instanceof Error ? error.message : 'An unexpected error occurred',
        [
          { 
            text: 'Show Debug Info', 
            onPress: () => {
              Alert.alert(
                'Authentication Debug Info',
                `Token: ${diagnosis.hasToken ? 'Present' : 'Missing'}\n` +
                `Token Valid: ${diagnosis.isTokenValid}\n` +
                `Server Reachable: ${diagnosis.canReachServer}\n` +
                `User: ${diagnosis.userInfo?.email || 'None'}\n` +
                `Error: ${diagnosis.error || 'None'}`,
                [{ text: 'OK' }]
              );
            }
          },
          { text: 'Try Again', onPress: () => handleJoinMeeting(meeting) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleJoinByID = async () => {
    if (!joinMeetingId.trim()) {
      Alert.alert('Error', 'Please enter a meeting ID');
      return;
    }
    
    try {
      console.log('Attempting to join meeting by ID:', joinMeetingId.trim());
      setShowJoinModal(false);
      
      // Join the meeting through the backend first
      const meeting = await joinMeetingByMeetingId(joinMeetingId.trim());
      
      // Navigate to the call screen with the validated meeting ID
      router.push(`/call/${meeting.meetingId}` as any);
      setJoinMeetingId('');
    } catch (error) {
      console.error('Failed to join meeting by ID:', error);
      setShowJoinModal(false);
      
      // Run diagnosis to help understand the issue
      const diagnosis = await diagnoseAuth();
      
      Alert.alert(
        'Failed to Join Meeting', 
        error instanceof Error ? error.message : 'Invalid meeting ID or meeting not found',
        [
          { 
            text: 'Show Debug Info', 
            onPress: () => {
              Alert.alert(
                'Authentication Debug Info',
                `Token: ${diagnosis.hasToken ? 'Present' : 'Missing'}\n` +
                `Token Valid: ${diagnosis.isTokenValid}\n` +
                `Server Reachable: ${diagnosis.canReachServer}\n` +
                `User: ${diagnosis.userInfo?.email || 'None'}\n` +
                `Error: ${diagnosis.error || 'None'}`,
                [{ text: 'OK' }]
              );
            }
          },
          { text: 'Try Again', onPress: () => setShowJoinModal(true) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      setJoinMeetingId('');
    }
  };

  const handleStartInstantMeeting = async () => {
    try {
      console.log('Starting instant meeting...');
      
      // Create an instant meeting through the backend
      const meeting = await createInstantMeeting();
      
      // Navigate to the call screen with the new meeting ID
      router.push(`/call/${meeting.meetingId}` as any);
    } catch (error) {
      console.error('Failed to start instant meeting:', error);
      
      // Run diagnosis to help understand the issue
      const diagnosis = await diagnoseAuth();
      
      Alert.alert(
        'Failed to Start Meeting', 
        error instanceof Error ? error.message : 'An unexpected error occurred',
        [
          { 
            text: 'Show Debug Info', 
            onPress: () => {
              Alert.alert(
                'Authentication Debug Info',
                `Token: ${diagnosis.hasToken ? 'Present' : 'Missing'}\n` +
                `Token Valid: ${diagnosis.isTokenValid}\n` +
                `Server Reachable: ${diagnosis.canReachServer}\n` +
                `User: ${diagnosis.userInfo?.email || 'None'}\n` +
                `Error: ${diagnosis.error || 'None'}`,
                [{ text: 'OK' }]
              );
            }
          },
          { text: 'Try Again', onPress: () => handleStartInstantMeeting() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleUseTemplate = (template: any) => {
    setShowTemplatesModal(false);
    setShowCreateModal(true);
    // Here you would pass the template data to the CreateMeetingModal
    // For now, we'll just show the modal
  };

  const copyMeetingId = (meetingId: string) => {
    // In a real app, you'd use Clipboard.setString
    Alert.alert('Meeting ID Copied', `Meeting ID: ${meetingId}`);
  };

  const handleAddToCalendar = (meeting: MeetingDto) => {
    setSelectedMeetingForCalendar(meeting);
    setShowCalendarModal(true);
  };

  const handleCalendarAdded = (calendarId: string) => {
    Alert.alert('Success', 'Meeting has been added to your calendar!');
    setShowCalendarModal(false);
    setSelectedMeetingForCalendar(null);
  };

  const handleCancelMeeting = async (meeting: MeetingDto) => {
    Alert.alert(
      'Cancel Meeting',
      `Are you sure you want to cancel "${meeting.title}"? All participants will be notified.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Cancelling meeting:', meeting.meetingId);
              await apiService.cancelMeeting(meeting.meetingId);
              Alert.alert('Success', 'Meeting cancelled successfully. Notifications have been sent to all participants.');
              fetchMeetings(); // Refresh the meetings list
            } catch (error) {
              console.error('Failed to cancel meeting:', error);
              Alert.alert('Error', 'Failed to cancel meeting. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Filter meetings based on active tab and search/filter criteria
  const filteredMeetings = (() => {
    let baseMeetings = activeTab === 'upcoming' 
      ? upcomingMeetings 
      : meetings.filter(m => m.status === 'COMPLETED' || m.status === 'CANCELLED');
    
    // Apply search filter
    if (searchQuery.trim()) {
      baseMeetings = baseMeetings.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.meetingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (selectedFilter !== 'all') {
      baseMeetings = baseMeetings.filter(m => m.type === selectedFilter);
    }
    
    return baseMeetings;
  })();

  // Calculate stats for dashboard
  const stats = {
    totalMeetings: meetings.length,
    upcomingCount: upcomingMeetings.length,
    hoursThisWeek: Math.floor(Math.random() * 20) + 5, // Mock data
    completedThisMonth: meetings.filter(m => m.status === 'COMPLETED').length,
  };

  const styles = createStyles(theme);

  // Animation effect for search
  useEffect(() => {
    const isSearching = searchQuery.trim().length > 0;
    
    Animated.parallel([
      Animated.timing(quickActionsHeight, {
        toValue: isSearching ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(quickActionsOpacity, {
        toValue: isSearching ? 0 : 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [searchQuery]);

  return (
    <ThemedLinearGradient style={{ ...styles.container, height: usableHeight }}>
      <AnimatedBackgroundCircle height={usableHeight} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Meetings</Text>
          <TouchableOpacity 
            style={styles.headerFab}
            onPress={handleStartInstantMeeting}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.mainScrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchMeetings}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Statistics Dashboard */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={styles.statNumber}>{stats.totalMeetings}</Text>
              <Text style={styles.statLabel}>Total Meetings</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={20} color={theme.colors.success} />
              <Text style={styles.statNumber}>{stats.upcomingCount}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statCard}>
              <Timer size={20} color={theme.colors.warning} />
              <Text style={styles.statNumber}>{stats.hoursThisWeek}h</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Video size={20} color={theme.colors.error} />
              <Text style={styles.statNumber}>{stats.completedThisMonth}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          {/* Search and Filters */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Search size={20} color={theme.colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search meetings..."
                placeholderTextColor={theme.colors.textTertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.filterButton, showFilters && styles.filterButtonActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} color={showFilters ? '#ffffff' : theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Filter Options */}
          {showFilters && (
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'GENERAL', label: 'General' },
                  { key: 'BUSINESS', label: 'Business' },
                  { key: 'CLASSROOM', label: 'Classroom' },
                  { key: 'ONE_ON_ONE', label: 'One-on-One' },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterChip,
                      selectedFilter === filter.key && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedFilter(filter.key as any)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedFilter === filter.key && styles.filterChipTextActive
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quick Actions - Animated */}
          <Animated.View 
            style={[
              styles.quickActions,
              {
                height: quickActionsHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 140], // Increased from 100 to 140 to accommodate all buttons
                }),
                opacity: quickActionsOpacity,
                overflow: 'hidden',
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleStartInstantMeeting}
            >
              <Play color="#ffffff" size={20} />
              <Text style={styles.primaryActionText}>Start Instant Meeting</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => setShowJoinModal(true)}
              >
                <Hash color={theme.colors.primary} size={20} />
                <Text style={styles.secondaryActionText}>Join by ID</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus color={theme.colors.primary} size={20} />
                <Text style={styles.secondaryActionText}>Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => setShowTemplatesModal(true)}
              >
                <FileText color={theme.colors.primary} size={20} />
                <Text style={styles.secondaryActionText}>Templates</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
              onPress={() => setActiveTab('upcoming')}
            >
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                Upcoming
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchMeetings}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Meetings List */}
          <View style={styles.section}>
            {isLoading ? (
              // Loading skeleton
              <View>
                {[1, 2, 3].map((index) => (
                  <View key={index} style={styles.skeletonCard}>
                    <View style={styles.skeletonHeader}>
                      <View style={styles.skeletonTitle} />
                      <View style={styles.skeletonBadge} />
                    </View>
                    <View style={styles.skeletonContent}>
                      <View style={styles.skeletonLine} />
                      <View style={styles.skeletonLineShort} />
                    </View>
                  </View>
                ))}
              </View>
            ) : filteredMeetings.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>
                  {searchQuery.trim() 
                    ? 'No meetings found' 
                    : activeTab === 'upcoming' 
                      ? 'No upcoming meetings' 
                      : 'No meeting history'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery.trim()
                    ? 'Try adjusting your search or filters'
                    : activeTab === 'upcoming' 
                      ? 'Create a new meeting to get started' 
                      : 'Your completed meetings will appear here'}
                </Text>
                {!searchQuery.trim() && activeTab === 'upcoming' && (
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => setShowCreateModal(true)}
                  >
                    <Plus size={16} color="#ffffff" />
                    <Text style={styles.emptyStateButtonText}>Schedule Meeting</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredMeetings.map((meeting) => (
                <View key={meeting.id} style={styles.meetingCard}>
                  <View style={styles.meetingHeader}>
                    <View style={styles.meetingInfo}>
                      <View style={styles.meetingTitleRow}>
                        <Text style={styles.meetingTitle}>{meeting.title}</Text>
                        {meeting.status === 'IN_PROGRESS' && (
                          <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.meetingHost}>
                        Hosted by {meeting.host.name}
                      </Text>
                      {meeting.description && (
                        <Text style={styles.meetingDescription} numberOfLines={2}>
                          {meeting.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.meetingStatusContainer}>
                      <View style={[
                        styles.meetingTypeBadge,
                        { backgroundColor: getMeetingTypeColor(meeting.type) + '20' }
                      ]}>
                        <Text style={[
                          styles.meetingTypeText,
                          { color: getMeetingTypeColor(meeting.type) }
                        ]}>
                          {meeting.type.replace('_', ' ')}
                        </Text>
                      </View>
                      {activeTab === 'history' && (
                        <View style={[
                          styles.meetingStatusBadge,
                          { backgroundColor: getMeetingStatusColor(meeting.status) + '20' }
                        ]}>
                          <Text style={[
                            styles.meetingStatusText,
                            { color: getMeetingStatusColor(meeting.status) }
                          ]}>
                            {meeting.status.replace('_', ' ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.meetingDetails}>
                    <View style={styles.meetingTime}>
                      <Calendar size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.meetingTimeText}>
                        {formatDate(meeting.startTime)}
                      </Text>
                      <Clock size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.meetingTimeText}>
                        {formatTime(meeting.startTime)}
                        {meeting.endTime && ` - ${formatTime(meeting.endTime)}`}
                      </Text>
                    </View>
                    
                    {meeting.participants && meeting.participants.length > 0 && (
                      <View style={styles.meetingParticipants}>
                        <Users size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.participantsText}>
                          {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                        </Text>
                        {/* Participant avatars preview */}
                        <View style={styles.participantAvatars}>
                          {meeting.participants.slice(0, 3).map((participant, index) => (
                            <View key={participant.id} style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}>
                              <Text style={styles.avatarText}>
                                {participant.user.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          ))}
                          {meeting.participants.length > 3 && (
                            <View style={[styles.avatar, styles.avatarMore, { marginLeft: -8 }]}>
                              <Text style={styles.avatarText}>+{meeting.participants.length - 3}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {meeting.meetingId && (
                      <TouchableOpacity 
                        style={styles.meetingIdContainer}
                        onPress={() => copyMeetingId(meeting.meetingId)}
                      >
                        <Hash size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.meetingIdText}>ID: {meeting.meetingId}</Text>
                        <Copy size={14} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {activeTab === 'upcoming' && meeting.status === 'SCHEDULED' && (
                    <View style={styles.meetingActions}>
                      <TouchableOpacity 
                        style={styles.calendarButton}
                        onPress={() => handleAddToCalendar(meeting)}
                      >
                        <CalendarDays size={16} color={theme.colors.primary} />
                        <Text style={styles.calendarButtonText}>Add to Calendar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.joinButton}
                        onPress={() => handleJoinMeeting(meeting)}
                      >
                        <Video size={16} color="#ffffff" />
                        <Text style={styles.joinButtonText}>Join</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Quick Action Menu */}
                  <View style={styles.quickActionsMenu}>
                    <TouchableOpacity style={styles.quickActionButton}>
                      <Edit3 size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                      <Share size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    {meeting.status !== 'IN_PROGRESS' && meeting.status !== 'COMPLETED' && (
                      <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => handleCancelMeeting(meeting)}
                      >
                        <Trash2 size={14} color={theme.colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Join by ID Modal */}
        <Modal
          visible={showJoinModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowJoinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.joinModalContent}>
              <View style={styles.joinModalHeader}>
                <View style={styles.joinModalTitleContainer}>
                  <View style={styles.joinModalIconContainer}>
                    <Hash size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.joinModalTitle}>Join Meeting</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowJoinModal(false)}
                  style={styles.joinModalCloseButton}
                >
                  <X color={theme.colors.textSecondary} size={24} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.joinModalSubtitle}>
                Enter your meeting ID to join an ongoing meeting
              </Text>
              
              <View style={styles.joinInputContainer}>
                <View style={styles.joinInputWrapper}>
                  <Hash size={20} color={theme.colors.textTertiary} />
                  <TextInput
                    style={styles.joinMeetingIdInput}
                    value={joinMeetingId}
                    onChangeText={setJoinMeetingId}
                    placeholder="Enter Meeting ID (e.g., 123-456-789)"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="join"
                    onSubmitEditing={handleJoinByID}
                  />
                </View>
                {joinMeetingId.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearInputButton}
                    onPress={() => setJoinMeetingId('')}
                  >
                    <X size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.joinModalInfo}>
                <View style={styles.joinInfoItem}>
                  <Video size={16} color={theme.colors.primary} />
                  <Text style={styles.joinInfoText}>Join instantly with camera & microphone</Text>
                </View>
                <View style={styles.joinInfoItem}>
                  <Users size={16} color={theme.colors.primary} />
                  <Text style={styles.joinInfoText}>Connect with participants worldwide</Text>
                </View>
              </View>
              
              <View style={styles.joinModalButtons}>
                <TouchableOpacity 
                  style={styles.joinModalCancelButton}
                  onPress={() => setShowJoinModal(false)}
                >
                  <Text style={styles.joinModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.joinModalJoinButton,
                    !joinMeetingId.trim() && styles.joinModalJoinButtonDisabled
                  ]}
                  onPress={handleJoinByID}
                  disabled={!joinMeetingId.trim()}
                >
                  <Play size={18} color="#ffffff" />
                  <Text style={styles.joinModalJoinText}>Join Meeting</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Templates Modal */}
        <Modal
          visible={showTemplatesModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTemplatesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.templatesModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Meeting Templates</Text>
                <TouchableOpacity onPress={() => setShowTemplatesModal(false)}>
                  <X color={theme.colors.textSecondary} size={24} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.templatesScrollView}>
                {meetingTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <TouchableOpacity
                      key={template.id}
                      style={styles.templateCard}
                      onPress={() => handleUseTemplate(template)}
                    >
                      <View style={[styles.templateIconContainer, { backgroundColor: template.color + '20' }]}>
                        <IconComponent size={24} color={template.color} />
                      </View>
                      <View style={styles.templateInfo}>
                        <View style={styles.templateHeader}>
                          <Text style={styles.templateName}>{template.name}</Text>
                          <View style={styles.templateCategory}>
                            <Text style={styles.templateCategoryText}>{template.category}</Text>
                          </View>
                        </View>
                        <Text style={styles.templateDescription}>{template.description}</Text>
                        <View style={styles.templateFooter}>
                          <View style={styles.templateMeta}>
                            <Clock size={12} color={theme.colors.textTertiary} />
                            <Text style={styles.templateDuration}>{template.duration} min</Text>
                          </View>
                          <View style={styles.templateMeta}>
                            <Users size={12} color={theme.colors.textTertiary} />
                            <Text style={styles.templateParticipants}>{template.participants}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <CreateMeetingModal 
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
        {selectedMeetingForCalendar && (
          <CalendarPickerModal 
            visible={showCalendarModal}
            onClose={() => setShowCalendarModal(false)}
            meeting={{
              id: selectedMeetingForCalendar.id?.toString(),
              meetingId: selectedMeetingForCalendar.meetingId,
              title: selectedMeetingForCalendar.title,
              description: selectedMeetingForCalendar.description,
              startTime: selectedMeetingForCalendar.startTime,
              endTime: selectedMeetingForCalendar.endTime,
            }}
            onAddToCalendar={handleCalendarAdded}
          />
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  headerFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 20,
    paddingTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    minHeight: 50,
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 50,
  },
  secondaryActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginLeft: 6,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  meetingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  meetingInfo: {
    flex: 1,
    marginRight: 12,
  },
  meetingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  meetingHost: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  meetingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  meetingStatusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  meetingTypeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  meetingTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  meetingStatusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  meetingStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  meetingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  meetingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  meetingParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  meetingIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingIdText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  meetingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  calendarButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  templatesModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  meetingIdInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
  },
  modalJoinButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalJoinText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  templatesScrollView: {
    maxHeight: 400,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  templateDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },

  // Professional Join Modal Styles
  joinModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  joinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  joinModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  joinModalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  joinModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  joinModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  joinModalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  joinInputContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  joinInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  joinMeetingIdInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginLeft: 12,
    padding: 0,
  },
  clearInputButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinModalInfo: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  joinInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  joinInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  joinModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  joinModalCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  joinModalCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
  },
  joinModalJoinButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinModalJoinButtonDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  joinModalJoinText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },

  // Statistics Dashboard Styles
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    marginLeft: 12,
    padding: 0,
  },
  filterButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },

  // Loading Skeleton Styles
  skeletonCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    flex: 0.6,
  },
  skeletonBadge: {
    height: 16,
    width: 60,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    flex: 1,
  },
  skeletonLineShort: {
    height: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    width: '60%',
  },

  // Enhanced Empty State
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },

  // Enhanced Meeting Card Styles
  meetingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: theme.colors.error,
  },
  participantAvatars: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  avatarMore: {
    backgroundColor: theme.colors.textTertiary,
  },
  avatarText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  quickActionsMenu: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  quickActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Additional Template Modal Styles
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateCategory: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  templateCategoryText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateParticipants: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
});