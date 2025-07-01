import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, Calendar, Clock, Users, CreditCard as Edit3, FileText, GraduationCap, Briefcase } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { WhiteboardComponent } from '@/components/WhiteboardComponent';
import { SharedNotesComponent } from '@/components/SharedNotesComponent';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showSharedNotes, setShowSharedNotes] = useState(false);

  const upcomingMeetings = [
    {
      id: '1',
      title: 'With Emily',
      time: 'Today at 11:00',
      timeShort: 'Today 11:00',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    },
  ];

  const recentCalls = [
    {
      id: '1',
      name: 'Jason',
      duration: '00:50',
      time: '09:36',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      hasVideo: true,
    },
    {
      id: '2',
      name: 'Megan',
      duration: 'Yesterday',
      time: 'Yesterday',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      hasVideo: true,
    },
    {
      id: '3',
      name: 'Team Meeting',
      duration: 'Monday',
      time: 'Monday',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      hasVideo: true,
    },
  ];

  const handleNewCall = () => {
    const newCallId = 'instant-' + Date.now();
    router.push(`/call/${newCallId}`);
  };

  const handleJoinCall = (callId: string) => {
    router.push(`/call/${callId}`);
  };

  const handleNavigateToTab = (tabName: string) => {
    router.push(`/(tabs)/${tabName}`);
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome, Alex</Text>
          </View>

          <View style={styles.newCallSection}>
            <TouchableOpacity style={styles.newCallButton} onPress={handleNewCall}>
              <View style={styles.newCallIcon}>
                <Video color="#ffffff" size={32} />
              </View>
              <Text style={styles.newCallText}>New Call</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tools</Text>
            <View style={styles.toolsGrid}>
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => setShowWhiteboard(true)}
              >
                <Edit3 color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Whiteboard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => setShowSharedNotes(true)}
              >
                <FileText color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Shared Notes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => handleNavigateToTab('classroom')}
              >
                <GraduationCap color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Classroom</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => handleNavigateToTab('business')}
              >
                <Briefcase color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Business</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingMeetings.map((meeting) => (
              <TouchableOpacity
                key={meeting.id}
                style={styles.meetingCard}
                onPress={() => handleJoinCall(meeting.id)}
              >
                <View style={styles.meetingInfo}>
                  <View style={styles.meetingIcon}>
                    <Calendar color={theme.colors.primary} size={20} />
                  </View>
                  <View style={styles.meetingDetails}>
                    <Text style={styles.meetingTitle}>{meeting.title}</Text>
                    <Text style={styles.meetingTime}>{meeting.time}</Text>
                  </View>
                </View>
                <Text style={styles.meetingTimeShort}>{meeting.timeShort}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {recentCalls.map((call) => (
              <TouchableOpacity
                key={call.id}
                style={styles.callCard}
                onPress={() => handleJoinCall(call.id)}
              >
                <Image source={{ uri: call.avatar }} style={styles.avatar} />
                <View style={styles.callInfo}>
                  <Text style={styles.callName}>{call.name}</Text>
                  <Text style={styles.callDuration}>{call.duration}</Text>
                </View>
                <View style={styles.callActions}>
                  <Text style={styles.callTime}>{call.time}</Text>
                  {call.hasVideo && (
                    <View style={styles.videoIndicator}>
                      <Video color={theme.colors.primary} size={16} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Whiteboard Component */}
        <WhiteboardComponent 
          visible={showWhiteboard}
          onClose={() => setShowWhiteboard(false)}
        />

        {/* Shared Notes Component */}
        <SharedNotesComponent 
          visible={showSharedNotes}
          onClose={() => setShowSharedNotes(false)}
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  newCallSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  newCallButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  newCallIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  newCallText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
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
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '22%',
  },
  toolText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  meetingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  meetingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  meetingDetails: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  meetingTimeShort: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  callDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  callActions: {
    alignItems: 'flex-end',
  },
  callTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  videoIndicator: {
    padding: 4,
  },
});