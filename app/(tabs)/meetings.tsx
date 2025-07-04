import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, Video, Plus, Hash, Play, Settings, FileText, X, Copy, CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
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
import { MeetingDto } from '@/services/api';

export default function MeetingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: deviceHeight } = Dimensions.get('window');
  const usableHeight = deviceHeight - insets.top - insets.bottom;
  
  const { meetings, upcomingMeetings, isLoading, error, fetchMeetings, joinMeeting } = useMeetings();
  const { diagnoseAuth } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedMeetingForCalendar, setSelectedMeetingForCalendar] = useState<MeetingDto | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [joinMeetingId, setJoinMeetingId] = useState('');

  // Meeting templates
  const meetingTemplates = [
    {
      id: 'daily-standup',
      name: 'Daily Standup',
      description: '15-minute team sync meeting',
      duration: 15,
      type: 'BUSINESS',
      icon: '🔄',
    },
    {
      id: 'one-on-one',
      name: 'One-on-One',
      description: 'Private discussion with team member',
      duration: 30,
      type: 'ONE_ON_ONE',
      icon: '👥',
    },
    {
      id: 'project-review',
      name: 'Project Review',
      description: 'Review project progress and deliverables',
      duration: 60,
      type: 'BUSINESS',
      icon: '📊',
    },
    {
      id: 'training-session',
      name: 'Training Session',
      description: 'Educational or skill development session',
      duration: 90,
      type: 'CLASSROOM',
      icon: '🎓',
    },
    {
      id: 'team-retrospective',
      name: 'Team Retrospective',
      description: 'Reflect on past sprint and plan improvements',
      duration: 45,
      type: 'BUSINESS',
      icon: '🔍',
    },
    {
      id: 'client-presentation',
      name: 'Client Presentation',
      description: 'Present project updates to clients',
      duration: 60,
      type: 'BUSINESS',
      icon: '📈',
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

  const handleJoinByID = () => {
    if (!joinMeetingId.trim()) {
      Alert.alert('Error', 'Please enter a meeting ID');
      return;
    }
    setShowJoinModal(false);
    router.push(`/call/${joinMeetingId.trim()}` as any);
    setJoinMeetingId('');
  };

  const handleStartInstantMeeting = () => {
    const newCallId = 'instant-' + Date.now();
    router.push(`/call/${newCallId}` as any);
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

  // Filter meetings based on active tab
  const filteredMeetings = activeTab === 'upcoming' 
    ? upcomingMeetings 
    : meetings.filter(m => m.status === 'COMPLETED' || m.status === 'CANCELLED');

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={{ ...styles.container, height: usableHeight }}>
      <AnimatedBackgroundCircle height={usableHeight} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Meetings</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
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
        </View>

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

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchMeetings}
              tintColor={theme.colors.primary}
            />
          }
        >
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
            {filteredMeetings.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>
                  {activeTab === 'upcoming' ? 'No upcoming meetings' : 'No meeting history'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeTab === 'upcoming' 
                    ? 'Create a new meeting to get started' 
                    : 'Your completed meetings will appear here'}
                </Text>
              </View>
            ) : (
              filteredMeetings.map((meeting) => (
                <View key={meeting.id} style={styles.meetingCard}>
                  <View style={styles.meetingHeader}>
                    <View style={styles.meetingInfo}>
                      <Text style={styles.meetingTitle}>{meeting.title}</Text>
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
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Join by ID Modal */}
        <Modal
          visible={showJoinModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowJoinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Meeting</Text>
                <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                  <X color={theme.colors.textSecondary} size={24} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>Enter the meeting ID to join</Text>
              
              <TextInput
                style={styles.meetingIdInput}
                value={joinMeetingId}
                onChangeText={setJoinMeetingId}
                placeholder="Meeting ID"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowJoinModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalJoinButton}
                  onPress={handleJoinByID}
                >
                  <Text style={styles.modalJoinText}>Join</Text>
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
                {meetingTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.templateCard}
                    onPress={() => handleUseTemplate(template)}
                  >
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <View style={styles.templateInfo}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateDescription}>{template.description}</Text>
                      <Text style={styles.templateDuration}>{template.duration} minutes</Text>
                    </View>
                  </TouchableOpacity>
                ))}
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
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
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
});