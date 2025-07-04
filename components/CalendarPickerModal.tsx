import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  Share,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ExpoCalendar from 'expo-calendar';
import { Ionicons } from '@expo/vector-icons';

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  meeting: {
    id?: string;
    meetingId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
  };
  onAddToCalendar?: (calendarId: string) => void;
}

interface CalendarEvent {
  googleCalendarUrl: string;
  outlookCalendarUrl: string;
  icsDownloadUrl: string;
}

export default function CalendarPickerModal({
  visible,
  onClose,
  meeting,
  onAddToCalendar,
}: CalendarPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(meeting.startTime).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(new Date(meeting.startTime));
  const [endTime, setEndTime] = useState(
    meeting.endTime ? new Date(meeting.endTime) : new Date(Date.now() + 60 * 60 * 1000)
  );
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const onDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
    // Update times to selected date
    const newDate = new Date(day.dateString);
    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);
    
    newStartTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    newEndTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    
    setStartTime(newStartTime);
    setEndTime(newEndTime);
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartTime(selectedTime);
      // Auto-adjust end time to be 1 hour later if it's before start time
      if (selectedTime >= endTime) {
        setEndTime(new Date(selectedTime.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime && selectedTime > startTime) {
      setEndTime(selectedTime);
    }
  };

  const fetchCalendarEvent = async () => {
    try {
      setLoading(true);
      // For now, we'll create the calendar event client-side
      // In a real app, you'd fetch from your API with proper auth
      const event: CalendarEvent = {
        googleCalendarUrl: buildGoogleCalendarUrl(),
        outlookCalendarUrl: buildOutlookCalendarUrl(),
        icsDownloadUrl: `/api/meetings/${meeting.meetingId}/calendar/download`,
      };
      setCalendarEvent(event);
    } catch (error) {
      console.error('Error fetching calendar event:', error);
      Alert.alert('Error', 'Failed to prepare calendar event');
    } finally {
      setLoading(false);
    }
  };

  const buildGoogleCalendarUrl = () => {
    const title = encodeURIComponent(meeting.title);
    const description = encodeURIComponent(
      `Join InSync Meeting\n\nMeeting ID: ${meeting.meetingId}\nJoin URL: https://insync.app/join/${meeting.meetingId}\n\n${meeting.description || ''}\n\nPowered by InSync`
    );
    const location = encodeURIComponent(`InSync Meeting - ID: ${meeting.meetingId}`);
    
    const startDate = startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${startDate}/${endDate}`;
  };

  const buildOutlookCalendarUrl = () => {
    const title = encodeURIComponent(meeting.title);
    const description = encodeURIComponent(
      `Join InSync Meeting\n\nMeeting ID: ${meeting.meetingId}\nJoin URL: https://insync.app/join/${meeting.meetingId}\n\n${meeting.description || ''}\n\nPowered by InSync`
    );
    const location = encodeURIComponent(`InSync Meeting - ID: ${meeting.meetingId}`);
    
    const startDate = startTime.toISOString();
    const endDate = endTime.toISOString();
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&location=${location}&startdt=${startDate}&enddt=${endDate}`;
  };

  const addToDeviceCalendar = async () => {
    try {
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Calendar access is required to add meetings.');
        return;
      }

      const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source.name === 'Default') || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found to add the event.');
        return;
      }

      const eventDetails = {
        title: meeting.title,
        startDate: startTime,
        endDate: endTime,
        location: `InSync Meeting - ID: ${meeting.meetingId}`,
        notes: `${meeting.description || ''}\n\nJoin URL: https://insync.app/join/${meeting.meetingId}\nMeeting ID: ${meeting.meetingId}\n\nPowered by InSync`,
        alarms: [
          { relativeOffset: -15 }, // 15 minutes before
          { relativeOffset: -5 },  // 5 minutes before
        ],
      };

      await ExpoCalendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      Alert.alert('Success', 'Meeting added to your calendar!');
      onAddToCalendar?.(defaultCalendar.id);
      onClose();
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Failed to add meeting to calendar');
    }
  };

  const openGoogleCalendar = async () => {
    if (!calendarEvent) {
      await fetchCalendarEvent();
    }

    try {
      const url = calendarEvent?.googleCalendarUrl || buildGoogleCalendarUrl();
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Google Calendar');
      }
    } catch (error) {
      console.error('Error opening Google Calendar:', error);
      Alert.alert('Error', 'Failed to open Google Calendar');
    }
  };

  const openOutlookCalendar = async () => {
    if (!calendarEvent) {
      await fetchCalendarEvent();
    }

    try {
      const url = calendarEvent?.outlookCalendarUrl || buildOutlookCalendarUrl();
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Outlook Calendar');
      }
    } catch (error) {
      console.error('Error opening Outlook Calendar:', error);
      Alert.alert('Error', 'Failed to open Outlook Calendar');
    }
  };

  const downloadICSFile = async () => {
    try {
      const icsContent = generateICSContent();
      
      // Share the ICS content
      await Share.share({
        message: icsContent,
        title: `${meeting.title} - Meeting Invite`,
      });
    } catch (error) {
      console.error('Error downloading ICS file:', error);
      Alert.alert('Error', 'Failed to download calendar file');
    }
  };

  const generateICSContent = () => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeText = (text: string) => {
      return text.replace(/\\/g, '\\\\')
                .replace(/,/g, '\\,')
                .replace(/;/g, '\\;')
                .replace(/\n/g, '\\n');
    };

    const now = new Date();
    const uid = `${meeting.meetingId}-${now.getTime()}@insync.com`;

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InSync//Meeting Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${escapeText(meeting.title)}
DESCRIPTION:${escapeText(`Join InSync Meeting\\n\\nMeeting ID: ${meeting.meetingId}\\nJoin URL: https://insync.app/join/${meeting.meetingId}\\n\\n${meeting.description || ''}\\n\\nPowered by InSync`)}
LOCATION:${escapeText(`InSync Meeting - ID: ${meeting.meetingId}`)}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:InSync Meeting Reminder
END:VALARM
BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:InSync Meeting Reminder
END:VALARM
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  };

  React.useEffect(() => {
    if (visible && !calendarEvent) {
      fetchCalendarEvent();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Add to Calendar</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <Text style={styles.meetingId}>Meeting ID: {meeting.meetingId}</Text>
          
          {/* Calendar Date Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Calendar
              current={selectedDate}
              onDayPress={onDateSelect}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#007AFF',
                },
              }}
              theme={{
                selectedDayBackgroundColor: '#007AFF',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#007AFF',
                arrowColor: '#007AFF',
              }}
            />
          </View>

          {/* Time Pickers */}
          <View style={styles.timeSection}>
            <View style={styles.timePickerContainer}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add to Calendar</Text>
            
            <TouchableOpacity style={styles.calendarOption} onPress={addToDeviceCalendar}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
              <Text style={styles.calendarOptionText}>Add to Device Calendar</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.calendarOption} 
              onPress={openGoogleCalendar}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={24} color="#4285F4" />
              <Text style={styles.calendarOptionText}>Open in Google Calendar</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.calendarOption} 
              onPress={openOutlookCalendar}
              disabled={loading}
            >
              <Ionicons name="mail" size={24} color="#0078D4" />
              <Text style={styles.calendarOptionText}>Open in Outlook</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.calendarOption} 
              onPress={downloadICSFile}
              disabled={loading}
            >
              <Ionicons name="download" size={24} color="#666" />
              <Text style={styles.calendarOptionText}>Download Calendar File</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Time Pickers */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onStartTimeChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onEndTimeChange}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  meetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  meetingId: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 16,
  },
  timePickerContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  calendarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
});
