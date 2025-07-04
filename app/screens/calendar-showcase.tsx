import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Clock, Users, Video, Star } from 'lucide-react-native';
import CalendarPickerModal from '@/components/CalendarPickerModal';
import { useTheme } from '@/contexts/ThemeContext';

export default function CalendarShowcaseScreen() {
  const { theme } = useTheme();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<any>(null);

  // Demo meeting data
  const demoMeetings = [
    {
      id: 'demo-1',
      meetingId: 'ABC-123-DEF',
      title: 'Daily Team Standup',
      description: 'Quick sync-up with the development team to discuss progress and blockers.',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Tomorrow + 30 min
      type: 'BUSINESS',
      participants: 5,
    },
    {
      id: 'demo-2',
      meetingId: 'XYZ-789-GHI',
      title: 'Client Presentation',
      description: 'Present Q3 results and roadmap to key stakeholders.',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Day after tomorrow + 1 hour
      type: 'BUSINESS',
      participants: 8,
    },
    {
      id: 'demo-3',
      meetingId: 'EDU-456-JKL',
      title: 'Product Training Session',
      description: 'Comprehensive training on new product features for the sales team.',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 3 days from now + 1.5 hours
      type: 'CLASSROOM',
      participants: 12,
    },
  ];

  const features = [
    {
      icon: <CalendarDays size={24} color={theme.colors.primary} />,
      title: 'Multi-Platform Integration',
      description: 'Google Calendar, Outlook, and device calendar support',
    },
    {
      icon: <Clock size={24} color={theme.colors.success} />,
      title: 'Smart Reminders',
      description: 'Professional 15 and 5-minute default alerts',
    },
    {
      icon: <Star size={24} color={theme.colors.warning} />,
      title: 'ICS File Generation',
      description: 'Universal calendar format for any application',
    },
    {
      icon: <Users size={24} color={theme.colors.error} />,
      title: 'Enterprise Ready',
      description: 'Business-grade calendar integration',
    },
  ];

  const handleDemoCalendar = (meeting: any) => {
    setSelectedDemo(meeting);
    setShowCalendarModal(true);
  };

  const handleCalendarAdded = (calendarId: string) => {
    Alert.alert(
      'Calendar Integration Demo',
      `Successfully demonstrated calendar integration!\n\nIn a production environment, this meeting would be added to calendar: ${calendarId}`,
      [{ text: 'Brilliant!', style: 'default' }]
    );
    setShowCalendarModal(false);
    setSelectedDemo(null);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar Integration</Text>
          <Text style={styles.subtitle}>Professional meeting reminders, very professional indeed!</Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Professional Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>{feature.icon}</View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Demo Meetings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗓️ Try Calendar Integration</Text>
          <Text style={styles.sectionDescription}>
            Tap any meeting below to experience our professional calendar integration
          </Text>
          
          {demoMeetings.map((meeting) => (
            <View key={meeting.id} style={styles.meetingCard}>
              <View style={styles.meetingHeader}>
                <Text style={styles.meetingTitle}>{meeting.title}</Text>
                <View style={styles.meetingBadge}>
                  <Text style={styles.meetingBadgeText}>Demo</Text>
                </View>
              </View>
              
              <Text style={styles.meetingDescription}>{meeting.description}</Text>
              
              <View style={styles.meetingDetails}>
                <View style={styles.meetingDetailRow}>
                  <Clock size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.meetingDetailText}>
                    {formatDateTime(meeting.startTime)}
                  </Text>
                </View>
                
                <View style={styles.meetingDetailRow}>
                  <Users size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.meetingDetailText}>
                    {meeting.participants} participants
                  </Text>
                </View>
                
                <View style={styles.meetingDetailRow}>
                  <Video size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.meetingDetailText}>
                    ID: {meeting.meetingId}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => handleDemoCalendar(meeting)}
              >
                <CalendarDays size={20} color="#ffffff" />
                <Text style={styles.calendarButtonText}>Add to Calendar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Technical Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Technical Excellence</Text>
          <View style={styles.techCard}>
            <Text style={styles.techTitle}>Backend Integration</Text>
            <Text style={styles.techDescription}>
              • RESTful API endpoints for calendar events{'\n'}
              • ICS file generation with RFC 5545 compliance{'\n'}
              • Google Calendar and Outlook URL generation{'\n'}
              • Professional reminder defaults
            </Text>
          </View>
          
          <View style={styles.techCard}>
            <Text style={styles.techTitle}>Frontend Components</Text>
            <Text style={styles.techDescription}>
              • Cross-platform React Native implementation{'\n'}
              • Device calendar permissions and integration{'\n'}
              • Professional UI with brand consistency{'\n'}
              • Smart time validation and defaults
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎉 InSync Calendar Integration - Enterprise Grade
          </Text>
          <Text style={styles.footerSubtext}>
            Very professional, innit?
          </Text>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      {selectedDemo && (
        <CalendarPickerModal
          visible={showCalendarModal}
          onClose={() => {
            setShowCalendarModal(false);
            setSelectedDemo(null);
          }}
          meeting={selectedDemo}
          onAddToCalendar={handleCalendarAdded}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  meetingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    flex: 1,
  },
  meetingBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  meetingBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  meetingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  meetingDetails: {
    gap: 8,
    marginBottom: 20,
  },
  meetingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  calendarButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  techCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  techTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  techDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
