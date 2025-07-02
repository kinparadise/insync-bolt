import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Plus, Video, Users, Copy, Settings, X, Phone, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as CalendarAPI from 'expo-calendar';

export default function MeetingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [duration, setDuration] = useState(30);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [meetingType, setMeetingType] = useState('One-time');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [agenda, setAgenda] = useState('');
  const [reminder, setReminder] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Recurring meeting states
  const [recurringTitle, setRecurringTitle] = useState('');
  const [recurringStartDate, setRecurringStartDate] = useState<Date | null>(null);
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
  const [recurringTime, setRecurringTime] = useState<Date | null>(null);
  const [recurringDuration, setRecurringDuration] = useState(30);
  const [recurringPattern, setRecurringPattern] = useState('weekly');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [recurringParticipants, setRecurringParticipants] = useState<string[]>([]);
  const [recurringParticipantInput, setRecurringParticipantInput] = useState('');
  const [recurringAgenda, setRecurringAgenda] = useState('');
  const [recurringReminder, setRecurringReminder] = useState(false);
  const [recurringReminderMinutes, setRecurringReminderMinutes] = useState(10);
  const [showRecurringDatePicker, setShowRecurringDatePicker] = useState(false);
  const [showRecurringEndDatePicker, setShowRecurringEndDatePicker] = useState(false);
  const [showRecurringTimePicker, setShowRecurringTimePicker] = useState(false);
  const [recurringCurrentMonth, setRecurringCurrentMonth] = useState(new Date());
  const [recurringEndCurrentMonth, setRecurringEndCurrentMonth] = useState(new Date());

  // Helper to format date and time
  const formatDate = (date: Date | null) => date ? date.toLocaleDateString() : '';
  const formatTime = (date: Date | null) => date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Custom calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return currentMonth.getFullYear() === today.getFullYear() &&
           currentMonth.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return currentMonth.getFullYear() === selectedDate.getFullYear() &&
           currentMonth.getMonth() === selectedDate.getMonth() &&
           day === selectedDate.getDate();
  };

  const handleDayPress = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isTodayDate = isToday(day);
      const isSelectedDate = isSelected(day);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isTodayDate && styles.calendarDayToday,
            isSelectedDate && styles.calendarDaySelected
          ]}
          onPress={() => handleDayPress(day)}
        >
          <Text style={[
            styles.calendarDayText,
            isTodayDate && styles.calendarDayTextToday,
            isSelectedDate && styles.calendarDayTextSelected
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const meetings = [
    {
      id: '1',
      title: 'Team Standup',
      time: '09:00 AM',
      date: 'Today',
      participants: 5,
      type: 'recurring',
      status: 'upcoming',
      meetingId: 'abc-defg-hij',
    },
    {
      id: '2',
      title: 'Client Presentation',
      time: '02:00 PM',
      date: 'Today',
      participants: 8,
      type: 'scheduled',
      status: 'upcoming',
      meetingId: 'klm-nopq-rst',
    },
    {
      id: '3',
      title: 'Design Review',
      time: '10:00 AM',
      date: 'Tomorrow',
      participants: 3,
      type: 'scheduled',
      status: 'scheduled',
      meetingId: 'uvw-xyza-bcd',
    },
    {
      id: '4',
      title: 'All Hands Meeting',
      time: '03:00 PM',
      date: 'Friday',
      participants: 25,
      type: 'recurring',
      status: 'scheduled',
      meetingId: 'efg-hijk-lmn',
    },
  ];

  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/call/${meetingId}`);
  };

  const handleStartInstantMeeting = () => {
    const instantMeetingId = 'instant-' + Date.now();
    router.push(`/call/${instantMeetingId}`);
  };

  const handleScheduleMeeting = async () => {
    if (!meetingTitle.trim()) {
      Alert.alert('Error', 'Please enter a meeting title');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    console.log('Starting schedule meeting process...');
    console.log('Meeting details:', { meetingTitle, selectedDate, duration, agenda, participants });

    try {
      // Request calendar permissions
      console.log('Requesting calendar permissions...');
      const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
      console.log('Calendar permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Calendar permission is required to schedule meetings.');
        return;
      }

      // Get default calendar
      console.log('Getting calendars...');
      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      console.log('Available calendars:', calendars.length);
      
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
      console.log('Selected calendar:', defaultCalendar?.title || 'None');

      if (!defaultCalendar) {
        Alert.alert('No Calendar Found', 'No calendar found on your device.');
        return;
      }

      // Create calendar event
      const eventDetails = {
        title: meetingTitle,
        startDate: selectedDate,
        endDate: new Date(selectedDate.getTime() + duration * 60000), // Add duration
        location: 'InSync Meeting',
        notes: agenda || undefined,
        alarms: reminder ? [{ relativeOffset: -reminderMinutes }] : undefined,
        attendees: participants.length > 0 ? participants.map(email => ({ email })) : undefined,
      };

      console.log('Creating calendar event with details:', eventDetails);
      const eventId = await CalendarAPI.createEventAsync(defaultCalendar.id, eventDetails);
      console.log('Event created with ID:', eventId);
      
      Alert.alert(
        'Success!', 
        `Meeting "${meetingTitle}" has been scheduled and added to your calendar.\n\nEvent ID: ${eventId}`,
        [
          { text: 'OK', onPress: () => {
            // Reset form and close modal
            setShowScheduleModal(false);
            setMeetingTitle('');
            setSelectedDate(null);
            setParticipants([]);
            setAgenda('');
            setReminder(false);
            setReminderMinutes(10);
            setDuration(30);
            setMeetingType('One-time');
          }}
        ]
      );

    } catch (error) {
      console.error('Schedule meeting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to schedule meeting: ${errorMessage}`);
    }
  };

  const handleJoinById = () => {
    if (!joinMeetingId.trim()) {
      Alert.alert('Error', 'Please enter a meeting ID');
      return;
    }
    
    // Validate meeting ID format (basic validation)
    if (joinMeetingId.length < 6) {
      Alert.alert('Error', 'Please enter a valid meeting ID');
      return;
    }

    setShowJoinModal(false);
    router.push(`/join/${joinMeetingId}`);
    setJoinMeetingId('');
  };

  const handleRecurringMeetings = () => {
    setShowRecurringModal(true);
  };

  const handleScheduleRecurringMeeting = async () => {
    if (!recurringTitle.trim()) {
      Alert.alert('Error', 'Please enter a meeting title');
      return;
    }
    if (!recurringStartDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }
    if (!recurringEndDate) {
      Alert.alert('Error', 'Please select an end date');
      return;
    }
    if (!recurringTime) {
      Alert.alert('Error', 'Please select a time');
      return;
    }
    if (recurringEndDate <= recurringStartDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }
    if (recurringPattern === 'weekly' && recurringDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day of the week');
      return;
    }

    console.log('Starting recurring meeting schedule process...');
    console.log('Recurring meeting details:', {
      title: recurringTitle,
      startDate: recurringStartDate,
      endDate: recurringEndDate,
      time: recurringTime,
      pattern: recurringPattern,
      interval: recurringInterval,
      days: recurringDays,
      participants: recurringParticipants,
      agenda: recurringAgenda
    });

    try {
      // Request calendar permissions
      console.log('Requesting calendar permissions...');
      const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
      console.log('Calendar permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Calendar permission is required to schedule recurring meetings.');
        return;
      }

      // Get default calendar
      console.log('Getting calendars...');
      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      console.log('Available calendars:', calendars.length);
      
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
      console.log('Selected calendar:', defaultCalendar?.title || 'None');

      if (!defaultCalendar) {
        Alert.alert('No Calendar Found', 'No calendar found on your device.');
        return;
      }

      // Generate recurring events
      console.log('Generating recurring events...');
      const events = generateRecurringEvents();
      console.log(`Generated ${events.length} events`);
      
      let createdCount = 0;

      for (const eventDetails of events) {
        try {
          console.log('Creating event:', eventDetails.title, 'at', eventDetails.startDate);
          const eventId = await CalendarAPI.createEventAsync(defaultCalendar.id, eventDetails);
          console.log('Event created with ID:', eventId);
          createdCount++;
        } catch (error) {
          console.error('Failed to create event:', error);
        }
      }

      const patternText = recurringPattern === 'daily' ? 'daily' :
                         recurringPattern === 'weekly' ? `weekly on ${recurringDays.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')}` :
                         `monthly every ${recurringInterval} month(s)`;
      
      Alert.alert(
        'Success!', 
        `Created ${createdCount} recurring meetings for "${recurringTitle}"\n\nPattern: ${patternText}\nTime: ${recurringTime ? formatTime(recurringTime) : 'N/A'}\nDuration: ${recurringDuration} minutes\nCalendar: ${defaultCalendar.title}`,
        [
          { text: 'OK', onPress: () => {
            // Reset form and close modal
            setShowRecurringModal(false);
            setRecurringTitle('');
            setRecurringStartDate(null);
            setRecurringEndDate(null);
            setRecurringTime(null);
            setRecurringDays([]);
            setRecurringParticipants([]);
            setRecurringAgenda('');
            setRecurringReminder(false);
            setRecurringReminderMinutes(10);
            setRecurringDuration(30);
            setRecurringPattern('weekly');
            setRecurringInterval(1);
          }}
        ]
      );

    } catch (error) {
      console.error('Recurring meeting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to schedule recurring meetings: ${errorMessage}`);
    }
  };

  const generateRecurringEvents = () => {
    const events = [];
    const startDate = new Date(recurringStartDate!);
    const endDate = new Date(recurringEndDate!);
    const time = new Date(recurringTime!);
    
    // Set the time on start date
    startDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (recurringPattern === 'weekly') {
        const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (recurringDays.includes(dayOfWeek)) {
          events.push({
            title: recurringTitle,
            startDate: new Date(currentDate),
            endDate: new Date(currentDate.getTime() + recurringDuration * 60000),
            location: 'InSync Meeting',
            notes: recurringAgenda || undefined,
            alarms: recurringReminder ? [{ relativeOffset: -recurringReminderMinutes }] : undefined,
            attendees: recurringParticipants.length > 0 ? recurringParticipants.map(email => ({ email })) : undefined,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurringPattern === 'daily') {
        events.push({
          title: recurringTitle,
          startDate: new Date(currentDate),
          endDate: new Date(currentDate.getTime() + recurringDuration * 60000),
          location: 'InSync Meeting',
          notes: recurringAgenda || undefined,
          alarms: recurringReminder ? [{ relativeOffset: -recurringReminderMinutes }] : undefined,
          attendees: recurringParticipants.length > 0 ? recurringParticipants.map(email => ({ email })) : undefined,
        });
        currentDate.setDate(currentDate.getDate() + recurringInterval);
      } else if (recurringPattern === 'monthly') {
        events.push({
          title: recurringTitle,
          startDate: new Date(currentDate),
          endDate: new Date(currentDate.getTime() + recurringDuration * 60000),
          location: 'InSync Meeting',
          notes: recurringAgenda || undefined,
          alarms: recurringReminder ? [{ relativeOffset: -recurringReminderMinutes }] : undefined,
          attendees: recurringParticipants.length > 0 ? recurringParticipants.map(email => ({ email })) : undefined,
        });
        currentDate.setMonth(currentDate.getMonth() + recurringInterval);
      }
    }
    
    return events;
  };

  const toggleRecurringDay = (day: string) => {
    if (recurringDays.includes(day)) {
      setRecurringDays(recurringDays.filter(d => d !== day));
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };

  const addRecurringParticipant = () => {
    if (recurringParticipantInput.trim() && !recurringParticipants.includes(recurringParticipantInput.trim())) {
      setRecurringParticipants([...recurringParticipants, recurringParticipantInput.trim()]);
      setRecurringParticipantInput('');
    }
  };

  const removeRecurringParticipant = (idx: number) => {
    setRecurringParticipants(recurringParticipants.filter((_, i) => i !== idx));
  };

  const copyMeetingId = (meetingId: string) => {
    // In a real app, you would copy to clipboard
    Alert.alert('Copied', `Meeting ID "${meetingId}" copied to clipboard`);
  };

  const handleMeetingSettings = (meetingId: string) => {
    Alert.alert('Meeting Settings', `Configure settings for meeting ${meetingId}`);
  };

  const handleViewRecording = () => {
    Alert.alert('Recording', 'Opening meeting recording...');
  };

  const handleJoinByPhone = () => {
    Alert.alert('Join by Phone', 'Dial: +1-555-123-4567\nMeeting ID: 123-456-789');
  };

  const handleTestAudio = () => {
    Alert.alert('Audio Test', 'Testing speaker and microphone...\n\nEverything sounds good!');
  };

  const addParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput.trim())) {
      setParticipants([...participants, participantInput.trim()]);
      setParticipantInput('');
    }
  };
  const removeParticipant = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };



  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Meetings</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowScheduleModal(true)}
          >
            <Plus color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContent}
              style={styles.quickActionsScroll}
            >
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={handleStartInstantMeeting}
              >
                <Video color={theme.colors.primary} size={24} />
                <Text style={styles.quickActionText}>Start Instant Meeting</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setShowScheduleModal(true)}
              >
                <Calendar color={theme.colors.primary} size={24} />
                <Text style={styles.quickActionText}>Schedule Meeting</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setShowJoinModal(true)}
              >
                <Users color={theme.colors.primary} size={24} />
                <Text style={styles.quickActionText}>Join by ID</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={handleRecurringMeetings}
              >
                <Clock color={theme.colors.primary} size={24} />
                <Text style={styles.quickActionText}>Recurring</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Upcoming Meetings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
            {meetings.map((meeting) => (
              <View key={meeting.id} style={styles.meetingCard}>
                <View style={styles.meetingHeader}>
                  <View style={styles.meetingIcon}>
                    <Video color={theme.colors.primary} size={20} />
                  </View>
                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingTitle}>{meeting.title}</Text>
                    <View style={styles.meetingMeta}>
                      <Clock color={theme.colors.textSecondary} size={14} />
                      <Text style={styles.meetingTime}>
                        {meeting.date} at {meeting.time}
                      </Text>
                    </View>
                    <View style={styles.meetingDetails}>
                      <View style={styles.meetingIdContainer}>
                        <Text style={styles.meetingId}>ID: {meeting.meetingId}</Text>
                        <TouchableOpacity 
                          onPress={() => copyMeetingId(meeting.meetingId)}
                          style={styles.copyButton}
                        >
                          <Copy size={14} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.participantsBadge}>
                        <Users size={12} color={theme.colors.primary} />
                        <Text style={styles.participantsText}>{meeting.participants}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.meetingActions}>
                  <TouchableOpacity 
                    style={styles.joinButton}
                    onPress={() => handleJoinMeeting(meeting.id)}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => handleMeetingSettings(meeting.id)}
                  >
                    <Settings size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Recent Meetings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Meetings</Text>
            <View style={styles.recentMeeting}>
              <View style={styles.recentMeetingInfo}>
                <Text style={styles.recentMeetingTitle}>Product Review</Text>
                <Text style={styles.recentMeetingTime}>Yesterday, 2:00 PM</Text>
                <Text style={styles.recentMeetingDuration}>Duration: 45 minutes</Text>
              </View>
              <TouchableOpacity 
                style={styles.recentMeetingAction}
                onPress={handleViewRecording}
              >
                <Text style={styles.recentMeetingActionText}>View Recording</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Schedule Meeting Modal */}
        <Modal
          visible={showScheduleModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: 0 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Schedule Meeting</Text>
                <TouchableOpacity 
                  onPress={() => setShowScheduleModal(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  {/* Meeting Title */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Meeting Title</Text>
                    <TextInput
                      style={styles.textInput}
                      value={meetingTitle}
                      onChangeText={setMeetingTitle}
                      placeholder="Enter meeting title"
                      placeholderTextColor={theme.colors.textTertiary}
                    />
                  </View>

                  {/* Date & Time Picker */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {/* Date Picker */}
                    <View style={[styles.inputGroup, { flex: 1 }]}> 
                      <Text style={styles.inputLabel}>Date</Text>
                      <TouchableOpacity
                        style={styles.textInput}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: selectedDate ? theme.colors.text : theme.colors.textTertiary }}>
                          {selectedDate ? formatDate(selectedDate) : 'Select date'}
                        </Text>
                      </TouchableOpacity>
                      
                      {/* Custom Calendar Modal */}
                      <Modal
                        visible={showDatePicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowDatePicker(false)}
                      >
                        <View style={styles.modalOverlay}>
                          <View style={[styles.modalContent, { maxWidth: 350, width: '100%' }]}>
                            <View style={styles.modalHeader}>
                              <Text style={styles.modalTitle}>Select Date</Text>
                              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <X size={24} color={theme.colors.textSecondary} />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.calendarContainer}>
                              {/* Calendar Header */}
                              <View style={styles.calendarHeader}>
                                <TouchableOpacity onPress={() => changeMonth('prev')}>
                                  <ChevronLeft size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.calendarMonthText}>
                                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity onPress={() => changeMonth('next')}>
                                  <ChevronRight size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                              </View>
                              
                              {/* Calendar Days Header */}
                              <View style={styles.calendarDaysHeader}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                  <Text key={day} style={styles.calendarDayHeaderText}>
                                    {day}
                                  </Text>
                                ))}
                              </View>
                              
                              {/* Calendar Grid */}
                              <View style={styles.calendarGrid}>
                                {renderCalendar()}
                              </View>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    </View>
                    {/* Time Picker */}
                    <View style={[styles.inputGroup, { flex: 1 }]}> 
                      <Text style={styles.inputLabel}>Time</Text>
                      <TouchableOpacity
                        style={styles.textInput}
                        onPress={() => setShowTimePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: selectedDate ? theme.colors.text : theme.colors.textTertiary }}>
                          {selectedDate ? formatTime(selectedDate) : 'Select time'}
                        </Text>
                      </TouchableOpacity>
                      {showTimePicker && (
                        <DateTimePicker
                          value={selectedDate || new Date()}
                          mode="time"
                          display="default"
                          onChange={(event, date) => {
                            setShowTimePicker(false);
                            if (date && selectedDate) {
                              // Merge date and time
                              const merged = new Date(selectedDate);
                              merged.setHours(date.getHours());
                              merged.setMinutes(date.getMinutes());
                              setSelectedDate(merged);
                            } else if (date) {
                              setSelectedDate(date);
                            }
                          }}
                        />
                      )}
                    </View>
                  </View>

                  {/* Duration Quick Select */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Duration</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[15, 30, 60].map((min) => (
                        <TouchableOpacity
                          key={min}
                          style={[
                            styles.durationButton,
                            duration === min && styles.durationButtonActive
                          ]}
                          onPress={() => setDuration(min)}
                        >
                          <Text style={[
                            styles.durationButtonText,
                            duration === min && styles.durationButtonTextActive
                          ]}>{min} min</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Participants Input (chips) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Participants</Text>
                    <View style={styles.chipInputContainer}>
                      {participants.map((p, idx) => (
                        <View key={p} style={styles.chip}>
                          <Text style={styles.chipText}>{p}</Text>
                          <TouchableOpacity onPress={() => removeParticipant(idx)}>
                            <X size={14} color={theme.colors.textTertiary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TextInput
                        style={styles.chipTextInput}
                        value={participantInput}
                        onChangeText={setParticipantInput}
                        placeholder="Add email/name"
                        placeholderTextColor={theme.colors.textTertiary}
                        onSubmitEditing={addParticipant}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>

                  {/* Meeting Type Dropdown */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Meeting Type</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                    >
                      <Text style={styles.dropdownText}>{meetingType}</Text>
                    </TouchableOpacity>
                    {showTypeDropdown && (
                      <View style={styles.dropdownList}>
                        {['One-time', 'Recurring', 'Webinar'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setMeetingType(type);
                              setShowTypeDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownText}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Agenda/Notes */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Agenda / Notes</Text>
                    <TextInput
                      style={[styles.textInput, { minHeight: 60 }]}
                      value={agenda}
                      onChangeText={setAgenda}
                      placeholder="Add agenda or notes..."
                      placeholderTextColor={theme.colors.textTertiary}
                      multiline
                    />
                  </View>

                  {/* Reminder Toggle */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reminder</Text>
                    <View style={styles.reminderContainer}>
                      <TouchableOpacity
                        style={[styles.reminderToggle, reminder && styles.reminderToggleActive]}
                        onPress={() => setReminder(!reminder)}
                      >
                        <Text style={styles.reminderToggleText}>
                          {reminder ? `${reminderMinutes} min before` : 'Off'}
                        </Text>
                      </TouchableOpacity>
                      
                      {reminder && (
                        <View style={styles.reminderControls}>
                          <TouchableOpacity
                            style={styles.reminderButton}
                            onPress={() => setReminderMinutes(Math.max(5, reminderMinutes - 5))}
                          >
                            <Text style={styles.reminderButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.reminderMinutesText}>{reminderMinutes} min</Text>
                          <TouchableOpacity
                            style={styles.reminderButton}
                            onPress={() => setReminderMinutes(Math.min(60, reminderMinutes + 5))}
                          >
                            <Text style={styles.reminderButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>



                  {/* Summary Preview Card */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Summary</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Title:</Text> {`${meetingTitle || '-'}`}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Date:</Text> {selectedDate ? formatDate(selectedDate) : '-'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Time:</Text> {selectedDate ? formatTime(selectedDate) : '-'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Duration:</Text> {`${duration} min`}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Type:</Text> {`${meetingType}`}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Participants:</Text> {participants.length > 0 ? participants.join(', ') : '-'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Reminder:</Text> {reminder ? `${reminderMinutes} min before` : 'Off'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Agenda:</Text> {`${agenda || '-'}`}</Text>
                  </View>



                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setShowScheduleModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.scheduleButton}
                      onPress={handleScheduleMeeting}
                    >
                      <Text style={styles.scheduleButtonText}>Schedule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Join by ID Modal */}
        <Modal
          visible={showJoinModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowJoinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Meeting</Text>
                <TouchableOpacity 
                  onPress={() => setShowJoinModal(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Meeting ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={joinMeetingId}
                    onChangeText={setJoinMeetingId}
                    placeholder="Enter meeting ID"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.alternativeOptions}>
                  <TouchableOpacity 
                    style={styles.alternativeButton}
                    onPress={handleJoinByPhone}
                  >
                    <Phone size={16} color={theme.colors.primary} />
                    <Text style={styles.alternativeButtonText}>Join by phone instead</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.alternativeButton}
                    onPress={handleTestAudio}
                  >
                    <Settings size={16} color={theme.colors.primary} />
                    <Text style={styles.alternativeButtonText}>Test speaker and microphone</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowJoinModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.scheduleButton}
                    onPress={handleJoinById}
                  >
                    <Text style={styles.scheduleButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Recurring Meetings Modal */}
        <Modal
          visible={showRecurringModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRecurringModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: 0 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Schedule Recurring Meeting</Text>
                <TouchableOpacity 
                  onPress={() => setShowRecurringModal(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  {/* Meeting Title */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Meeting Title</Text>
                    <TextInput
                      style={styles.textInput}
                      value={recurringTitle}
                      onChangeText={setRecurringTitle}
                      placeholder="Enter meeting title"
                      placeholderTextColor={theme.colors.textTertiary}
                    />
                  </View>

                  {/* Date Range */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Start Date</Text>
                      <TouchableOpacity
                        style={styles.textInput}
                        onPress={() => setShowRecurringDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: recurringStartDate ? theme.colors.text : theme.colors.textTertiary }}>
                          {recurringStartDate ? formatDate(recurringStartDate) : 'Select start date'}
                        </Text>
                      </TouchableOpacity>
                      
                      {/* Custom Calendar Modal for Start Date */}
                      <Modal
                        visible={showRecurringDatePicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowRecurringDatePicker(false)}
                      >
                        <View style={styles.modalOverlay}>
                          <View style={[styles.modalContent, { maxWidth: 350, width: '100%' }]}>
                            <View style={styles.modalHeader}>
                              <Text style={styles.modalTitle}>Select Start Date</Text>
                              <TouchableOpacity onPress={() => setShowRecurringDatePicker(false)}>
                                <X size={24} color={theme.colors.textSecondary} />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.calendarContainer}>
                              {/* Calendar Header */}
                              <View style={styles.calendarHeader}>
                                <TouchableOpacity onPress={() => {
                                  setRecurringCurrentMonth(prev => {
                                    const newMonth = new Date(prev);
                                    newMonth.setMonth(prev.getMonth() - 1);
                                    return newMonth;
                                  });
                                }}>
                                  <ChevronLeft size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.calendarMonthText}>
                                  {recurringCurrentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity onPress={() => {
                                  setRecurringCurrentMonth(prev => {
                                    const newMonth = new Date(prev);
                                    newMonth.setMonth(prev.getMonth() + 1);
                                    return newMonth;
                                  });
                                }}>
                                  <ChevronRight size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                              </View>
                              
                              {/* Calendar Days Header */}
                              <View style={styles.calendarDaysHeader}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                  <Text key={day} style={styles.calendarDayHeaderText}>
                                    {day}
                                  </Text>
                                ))}
                              </View>
                              
                              {/* Calendar Grid */}
                              <View style={styles.calendarGrid}>
                                {(() => {
                                  const daysInMonth = new Date(recurringCurrentMonth.getFullYear(), recurringCurrentMonth.getMonth() + 1, 0).getDate();
                                  const firstDay = new Date(recurringCurrentMonth.getFullYear(), recurringCurrentMonth.getMonth(), 1).getDay();
                                  const days = [];
                                  
                                  // Add empty cells for days before the first day of the month
                                  for (let i = 0; i < firstDay; i++) {
                                    days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
                                  }
                                  
                                  // Add days of the month
                                  for (let day = 1; day <= daysInMonth; day++) {
                                    const currentDate = new Date(recurringCurrentMonth.getFullYear(), recurringCurrentMonth.getMonth(), day);
                                    const isToday = new Date().toDateString() === currentDate.toDateString();
                                    const isSelected = recurringStartDate && recurringStartDate.toDateString() === currentDate.toDateString();
                                    
                                    days.push(
                                      <TouchableOpacity
                                        key={day}
                                        style={[
                                          styles.calendarDay,
                                          isToday && styles.calendarDayToday,
                                          isSelected && styles.calendarDaySelected
                                        ]}
                                        onPress={() => {
                                          setRecurringStartDate(currentDate);
                                          setShowRecurringDatePicker(false);
                                        }}
                                      >
                                        <Text style={[
                                          styles.calendarDayText,
                                          isToday && styles.calendarDayTextToday,
                                          isSelected && styles.calendarDayTextSelected
                                        ]}>
                                          {day}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  }
                                  
                                  return days;
                                })()}
                              </View>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>End Date</Text>
                      <TouchableOpacity
                        style={styles.textInput}
                        onPress={() => setShowRecurringEndDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: recurringEndDate ? theme.colors.text : theme.colors.textTertiary }}>
                          {recurringEndDate ? formatDate(recurringEndDate) : 'Select end date'}
                        </Text>
                      </TouchableOpacity>
                      
                      {/* Custom Calendar Modal for End Date */}
                      <Modal
                        visible={showRecurringEndDatePicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowRecurringEndDatePicker(false)}
                      >
                        <View style={styles.modalOverlay}>
                          <View style={[styles.modalContent, { maxWidth: 350, width: '100%' }]}>
                            <View style={styles.modalHeader}>
                              <Text style={styles.modalTitle}>Select End Date</Text>
                              <TouchableOpacity onPress={() => setShowRecurringEndDatePicker(false)}>
                                <X size={24} color={theme.colors.textSecondary} />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.calendarContainer}>
                              {/* Calendar Header */}
                              <View style={styles.calendarHeader}>
                                <TouchableOpacity onPress={() => {
                                  setRecurringEndCurrentMonth(prev => {
                                    const newMonth = new Date(prev);
                                    newMonth.setMonth(prev.getMonth() - 1);
                                    return newMonth;
                                  });
                                }}>
                                  <ChevronLeft size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.calendarMonthText}>
                                  {recurringEndCurrentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity onPress={() => {
                                  setRecurringEndCurrentMonth(prev => {
                                    const newMonth = new Date(prev);
                                    newMonth.setMonth(prev.getMonth() + 1);
                                    return newMonth;
                                  });
                                }}>
                                  <ChevronRight size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                              </View>
                              
                              {/* Calendar Days Header */}
                              <View style={styles.calendarDaysHeader}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                  <Text key={day} style={styles.calendarDayHeaderText}>
                                    {day}
                                  </Text>
                                ))}
                              </View>
                              
                              {/* Calendar Grid */}
                              <View style={styles.calendarGrid}>
                                {(() => {
                                  const daysInMonth = new Date(recurringEndCurrentMonth.getFullYear(), recurringEndCurrentMonth.getMonth() + 1, 0).getDate();
                                  const firstDay = new Date(recurringEndCurrentMonth.getFullYear(), recurringEndCurrentMonth.getMonth(), 1).getDay();
                                  const days = [];
                                  
                                  // Add empty cells for days before the first day of the month
                                  for (let i = 0; i < firstDay; i++) {
                                    days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
                                  }
                                  
                                  // Add days of the month
                                  for (let day = 1; day <= daysInMonth; day++) {
                                    const currentDate = new Date(recurringEndCurrentMonth.getFullYear(), recurringEndCurrentMonth.getMonth(), day);
                                    const isToday = new Date().toDateString() === currentDate.toDateString();
                                    const isSelected = recurringEndDate && recurringEndDate.toDateString() === currentDate.toDateString();
                                    
                                    days.push(
                                      <TouchableOpacity
                                        key={day}
                                        style={[
                                          styles.calendarDay,
                                          isToday && styles.calendarDayToday,
                                          isSelected && styles.calendarDaySelected
                                        ]}
                                        onPress={() => {
                                          setRecurringEndDate(currentDate);
                                          setShowRecurringEndDatePicker(false);
                                        }}
                                      >
                                        <Text style={[
                                          styles.calendarDayText,
                                          isToday && styles.calendarDayTextToday,
                                          isSelected && styles.calendarDayTextSelected
                                        ]}>
                                          {day}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  }
                                  
                                  return days;
                                })()}
                              </View>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    </View>
                  </View>

                  {/* Time */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Time</Text>
                    <TouchableOpacity
                      style={styles.textInput}
                      onPress={() => setShowRecurringTimePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: recurringTime ? theme.colors.text : theme.colors.textTertiary }}>
                        {recurringTime ? formatTime(recurringTime) : 'Select time'}
                      </Text>
                    </TouchableOpacity>
                    {showRecurringTimePicker && (
                      <DateTimePicker
                        value={recurringTime || new Date()}
                        mode="time"
                        display="default"
                        onChange={(event, date) => {
                          setShowRecurringTimePicker(false);
                          if (date) {
                            setRecurringTime(date);
                          }
                        }}
                      />
                    )}
                  </View>

                  {/* Duration */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Duration</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[15, 30, 60, 90].map((min) => (
                        <TouchableOpacity
                          key={min}
                          style={[
                            styles.durationButton,
                            recurringDuration === min && styles.durationButtonActive
                          ]}
                          onPress={() => setRecurringDuration(min)}
                        >
                          <Text style={[
                            styles.durationButtonText,
                            recurringDuration === min && styles.durationButtonTextActive
                          ]}>{min} min</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Recurrence Pattern */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Recurrence Pattern</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['daily', 'weekly', 'monthly'].map((pattern) => (
                        <TouchableOpacity
                          key={pattern}
                          style={[
                            styles.durationButton,
                            recurringPattern === pattern && styles.durationButtonActive
                          ]}
                          onPress={() => setRecurringPattern(pattern)}
                        >
                          <Text style={[
                            styles.durationButtonText,
                            recurringPattern === pattern && styles.durationButtonTextActive
                          ]}>{pattern.charAt(0).toUpperCase() + pattern.slice(1)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Interval */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Interval</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <TouchableOpacity
                        style={styles.reminderButton}
                        onPress={() => setRecurringInterval(Math.max(1, recurringInterval - 1))}
                      >
                        <Text style={styles.reminderButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.reminderMinutesText}>{recurringInterval}</Text>
                      <TouchableOpacity
                        style={styles.reminderButton}
                        onPress={() => setRecurringInterval(Math.min(12, recurringInterval + 1))}
                      >
                        <Text style={styles.reminderButtonText}>+</Text>
                      </TouchableOpacity>
                      <Text style={styles.inputLabel}>
                        {recurringPattern === 'daily' ? 'days' : 
                         recurringPattern === 'weekly' ? 'weeks' : 'months'}
                      </Text>
                    </View>
                  </View>

                  {/* Weekly Days Selection */}
                  {recurringPattern === 'weekly' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Days of the Week</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.durationButton,
                              recurringDays.includes(day) && styles.durationButtonActive
                            ]}
                            onPress={() => toggleRecurringDay(day)}
                          >
                            <Text style={[
                              styles.durationButtonText,
                              recurringDays.includes(day) && styles.durationButtonTextActive
                            ]}>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Participants */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Participants</Text>
                    <View style={styles.chipInputContainer}>
                      {recurringParticipants.map((p, idx) => (
                        <View key={p} style={styles.chip}>
                          <Text style={styles.chipText}>{p}</Text>
                          <TouchableOpacity onPress={() => removeRecurringParticipant(idx)}>
                            <X size={14} color={theme.colors.textTertiary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TextInput
                        style={styles.chipTextInput}
                        value={recurringParticipantInput}
                        onChangeText={setRecurringParticipantInput}
                        placeholder="Add email/name"
                        placeholderTextColor={theme.colors.textTertiary}
                        onSubmitEditing={addRecurringParticipant}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>

                  {/* Agenda */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Agenda / Notes</Text>
                    <TextInput
                      style={[styles.textInput, { minHeight: 60 }]}
                      value={recurringAgenda}
                      onChangeText={setRecurringAgenda}
                      placeholder="Add agenda or notes..."
                      placeholderTextColor={theme.colors.textTertiary}
                      multiline
                    />
                  </View>

                  {/* Reminder */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reminder</Text>
                    <View style={styles.reminderContainer}>
                      <TouchableOpacity
                        style={[styles.reminderToggle, recurringReminder && styles.reminderToggleActive]}
                        onPress={() => setRecurringReminder(!recurringReminder)}
                      >
                        <Text style={styles.reminderToggleText}>
                          {recurringReminder ? `${recurringReminderMinutes} min before` : 'Off'}
                        </Text>
                      </TouchableOpacity>
                      
                      {recurringReminder && (
                        <View style={styles.reminderControls}>
                          <TouchableOpacity
                            style={styles.reminderButton}
                            onPress={() => setRecurringReminderMinutes(Math.max(5, recurringReminderMinutes - 5))}
                          >
                            <Text style={styles.reminderButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.reminderMinutesText}>{recurringReminderMinutes} min</Text>
                          <TouchableOpacity
                            style={styles.reminderButton}
                            onPress={() => setRecurringReminderMinutes(Math.min(60, recurringReminderMinutes + 5))}
                          >
                            <Text style={styles.reminderButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Summary Preview */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Recurring Meeting Summary</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Title:</Text> {`${recurringTitle || '-'}`}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Start Date:</Text> {recurringStartDate ? formatDate(recurringStartDate) : '-'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>End Date:</Text> {recurringEndDate ? formatDate(recurringEndDate) : '-'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Time:</Text> {recurringTime ? formatTime(recurringTime) : '-'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Duration:</Text> {`${recurringDuration} min`}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Pattern:</Text> {`${recurringPattern} (every ${recurringInterval} ${recurringPattern === 'daily' ? 'day(s)' : recurringPattern === 'weekly' ? 'week(s)' : 'month(s)'})`}</Text>
                    {recurringPattern === 'weekly' && (
                      <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Days:</Text> {recurringDays.length > 0 ? recurringDays.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ') : '-'}</Text>
                    )}
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Participants:</Text> {recurringParticipants.length > 0 ? recurringParticipants.join(', ') : '-'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Reminder:</Text> {recurringReminder ? `${recurringReminderMinutes} min before` : 'Off'}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Agenda:</Text> {`${recurringAgenda || '-'}`}</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setShowRecurringModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.scheduleButton}
                      onPress={handleScheduleRecurringMeeting}
                    >
                      <Text style={styles.scheduleButtonText}>Schedule Recurring</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
  scrollContent: {
    paddingBottom: 100,
  },
  quickActions: {
    marginBottom: 32,
  },
  quickActionsScroll: {
    paddingLeft: 24,
  },
  quickActionsContent: {
    paddingRight: 24,
    gap: 16,
  },
  quickActionButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 140,
    gap: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 16,
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
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  meetingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  meetingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingId: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  participantsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  meetingActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 10,
  },
  recentMeeting: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recentMeetingInfo: {
    flex: 1,
  },
  recentMeetingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  recentMeetingTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  recentMeetingDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
  recentMeetingAction: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recentMeetingActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
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
  modalClose: {
    padding: 4,
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
  alternativeOptions: {
    marginBottom: 20,
    gap: 12,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  alternativeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
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
  scheduleButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  summaryItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginRight: 8,
  },


  chipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 8,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  chipTextInput: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  dropdownList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  dropdownItem: {
    padding: 12,
  },
  reminderToggle: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  reminderToggleActive: {
    backgroundColor: theme.colors.primary,
  },
  reminderToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  reminderContainer: {
    gap: 12,
  },
  reminderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  reminderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  reminderMinutesText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  durationButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  durationButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayToday: {
    backgroundColor: theme.colors.primary,
  },
  calendarDaySelected: {
    backgroundColor: theme.colors.primary,
  },
  calendarDayText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  calendarDayTextToday: {
    color: '#fff',
  },
  calendarDayTextSelected: {
    color: '#fff',
  },
  calendarContainer: {
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDayHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});