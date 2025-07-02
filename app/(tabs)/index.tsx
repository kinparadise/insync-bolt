import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, Calendar, Clock, Users, CreditCard as Edit3, FileText, GraduationCap, Briefcase, User, Star, ChevronRight, Grid } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { WhiteboardComponent } from '@/components/WhiteboardComponent';
import { SharedNotesComponent } from '@/components/SharedNotesComponent';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';
import { useUser } from '@/contexts/UserContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: deviceHeight } = Dimensions.get('window');
  const usableHeight = deviceHeight - insets.top - insets.bottom;
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showSharedNotes, setShowSharedNotes] = useState(false);
  const { user } = useUser();

  // Mock user and stats
  const userName = 'Alex';
  const stats = [
    {
      label: 'Meetings this week',
      value: 5,
      icon: <Calendar color={theme.colors.primary} size={24} />, 
      color: theme.colors.primary,
    },
    {
      label: 'Calls this week',
      value: 8,
      icon: <Video color={theme.colors.success} size={24} />, 
      color: theme.colors.success,
    },
    {
      label: 'Upcoming today',
      value: 2,
      icon: <Clock color={theme.colors.warning} size={24} />, 
      color: theme.colors.warning,
    },
  ];

  // Rotating banner messages
  const bannerMessages = [
    "🎉 You've attended 5 meetings this week! Keep it up!",
    "✨ Try our new Meeting Templates feature for faster scheduling!",
    "💡 Tip: Use Shared Notes to collaborate in real time.",
    "🔔 Don't miss your next call—enable notifications in Settings!",
    "🚀 Invite your team to InSync for seamless collaboration!",
  ];
  const [bannerIndex, setBannerIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-rotate banner every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextBanner();
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerIndex]);

  const handleNextBanner = () => {
    // Fade out, change message, then fade in
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      setBannerIndex((prev) => (prev + 1) % bannerMessages.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    });
  };

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
    // Map tab names to valid route strings
    const tabRoutes: Record<string, string> = {
      classroom: '/screens/classroom',
      business: '/screens/business',
      contacts: '/(tabs)/contacts',
      meetings: '/(tabs)/meetings',
      settings: '/(tabs)/settings',
      index: '/(tabs)',
      tools: '/(tabs)/tools',
    };
    if (tabRoutes[tabName]) {
      router.push(tabRoutes[tabName] as any);
    }
  };

  // Animation refs
  const statsAnim = useRef(new Animated.Value(0)).current;
  const newCallAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(newCallAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

  // Tool card press effect
  const [pressedTool, setPressedTool] = useState<string | null>(null);

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={{ ...styles.container, height: usableHeight }}>
      <AnimatedBackgroundCircle height={usableHeight} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {/* Greeting and Avatar */}
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greeting}>Good morning, {userName} <Text style={{ fontSize: 22 }}>👋</Text></Text>
            </View>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              accessibilityLabel="Profile avatar"
              onPress={() => router.push('/auth/profile')}
            >
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarContainer} />
              ) : (
                <User color={theme.colors.primary} size={32} />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Stats Row (Animated) */}
          <Animated.View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            paddingHorizontal: 24,
            marginBottom: 24,
            opacity: statsAnim,
            transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
          }}>
            {stats.map((stat, idx) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.color + '15' }]}> 
                <View style={styles.statIcon}>{stat.icon}</View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Animated Motivational Banner */}
          <Animated.View style={[styles.banner, { opacity: fadeAnim }]}> 
            <Star color={theme.colors.primary} size={20} style={{ marginRight: 8 }} />
            <Text style={styles.bannerText}>{bannerMessages[bannerIndex]}</Text>
            <TouchableOpacity style={styles.bannerNext} onPress={handleNextBanner} accessibilityLabel="Next tip">
              <ChevronRight color={theme.colors.primary} size={20} />
            </TouchableOpacity>
          </Animated.View>

          {/* New Call Button (Animated) */}
          <Animated.View style={{
            opacity: newCallAnim,
            transform: [{ translateY: newCallAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
          }}>
            <View style={styles.newCallSection}>
              <TouchableOpacity 
                style={styles.newCallButton} 
                onPress={handleNewCall}
                accessibilityLabel="Start a new call"
              >
                <View style={styles.newCallIcon}>
                  <Video color="#ffffff" size={32} />
                </View>
                <Text style={styles.newCallText}>New Call</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Quick Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tools</Text>
            <View style={styles.toolsGrid}>
              <TouchableOpacity 
                style={[styles.toolCard, pressedTool === 'whiteboard' && styles.toolCardPressed]}
                onPressIn={() => setPressedTool('whiteboard')}
                onPressOut={() => setPressedTool(null)}
                onPress={() => setShowWhiteboard(true)}
                accessibilityLabel="Open Whiteboard"
                activeOpacity={0.85}
              >
                <Edit3 color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Whiteboard</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toolCard, pressedTool === 'notes' && styles.toolCardPressed]}
                onPressIn={() => setPressedTool('notes')}
                onPressOut={() => setPressedTool(null)}
                onPress={() => setShowSharedNotes(true)}
                accessibilityLabel="Open Shared Notes"
                activeOpacity={0.85}
              >
                <FileText color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Shared Notes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toolCard, pressedTool === 'classroom' && styles.toolCardPressed]}
                onPressIn={() => setPressedTool('classroom')}
                onPressOut={() => setPressedTool(null)}
                onPress={() => handleNavigateToTab('classroom')}
                accessibilityLabel="Go to Classroom"
                activeOpacity={0.85}
              >
                <GraduationCap color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Classroom</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toolCard, pressedTool === 'business' && styles.toolCardPressed]}
                onPressIn={() => setPressedTool('business')}
                onPressOut={() => setPressedTool(null)}
                onPress={() => handleNavigateToTab('business')}
                accessibilityLabel="Go to Business"
                activeOpacity={0.85}
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
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    marginHorizontal: 24,
    padding: 16,
    marginBottom: 32,
  },
  bannerText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
    flex: 1,
  },
  bannerNext: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 8,
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
  accentBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 0,
  },
  toolCardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
});