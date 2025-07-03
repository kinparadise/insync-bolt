import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, Video, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { useMeetings } from '@/hooks/useMeetings';
import { CreateMeetingModal } from '@/components/CreateMeetingModal';
import { MeetingDto } from '@/services/api';

export default function MeetingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: deviceHeight } = Dimensions.get('window');
  const usableHeight = deviceHeight - insets.top - insets.bottom;
  
  const { meetings, upcomingMeetings, isLoading, error, fetchMeetings, joinMeeting } = useMeetings();
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      await joinMeeting(meeting.id);
      router.push(`/call/${meeting.meetingId}` as any);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={{ ...styles.container, height: usableHeight }}>
      <AnimatedBackgroundCircle height={usableHeight} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Meetings</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus color="#fff" size={24} />
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

          {/* Upcoming Meetings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingMeetings.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No upcoming meetings</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create a new meeting to get started
                </Text>
              </View>
            ) : (
              upcomingMeetings.map((meeting) => (
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
                  </View>

                  <View style={styles.meetingActions}>
                    <TouchableOpacity 
                      style={styles.joinButton}
                      onPress={() => handleJoinMeeting(meeting)}
                    >
                      <Video size={16} color="#ffffff" />
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* All Meetings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Meetings</Text>
            {meetings.length === 0 ? (
              <View style={styles.emptyState}>
                <Video size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No meetings yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your meetings will appear here
                </Text>
              </View>
            ) : (
              meetings.map((meeting) => (
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
                  </View>

                  {meeting.status === 'SCHEDULED' && (
                    <View style={styles.meetingActions}>
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

        <CreateMeetingModal 
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
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
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
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
  meetingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
});