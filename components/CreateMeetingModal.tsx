import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Platform } from 'react-native';
import { X, Calendar, Clock, Users, Plus, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';
import { useMeetings } from '@/hooks/useMeetings';
import { useContacts } from '@/hooks/useContacts';
import { CreateMeetingRequest, MeetingDto } from '@/services/api';
import CalendarPickerModal from '@/components/CalendarPickerModal';

interface CreateMeetingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateMeetingModal({ visible, onClose }: CreateMeetingModalProps) {
  const { theme } = useTheme();
  const { createMeeting } = useMeetings();
  const { allUsers } = useContacts();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [type, setType] = useState<CreateMeetingRequest['type']>('GENERAL');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [customParticipants, setCustomParticipants] = useState<string[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(true); // Default to true for professional experience
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<MeetingDto | null>(null);

  const meetingTypes = [
    { value: 'GENERAL', label: 'General Meeting' },
    { value: 'CLASSROOM', label: 'Classroom' },
    { value: 'BUSINESS', label: 'Business Meeting' },
    { value: 'ONE_ON_ONE', label: 'One-on-One' },
  ] as const;

  const handleCreateMeeting = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Meeting title is required');
      return;
    }

    setIsLoading(true);
    try {
      // Combine date and time for start
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
      
      // Combine date and time for end
      const endDateTime = new Date(startDate);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
      
      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        Alert.alert('Error', 'End time must be after start time');
        return;
      }

      const meetingData: CreateMeetingRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type,
        participantIds: selectedParticipants.length > 0 ? selectedParticipants : undefined,
        // TODO: Add custom participants to backend API
        // customParticipants: customParticipants.length > 0 ? customParticipants : undefined,
      };

      const createdMeeting = await createMeeting(meetingData);
      
      if (addToCalendar && createdMeeting) {
        setCreatedMeeting(createdMeeting);
        setShowCalendarModal(true);
      } else {
        Alert.alert('Success', 'Meeting created successfully');
        handleClose();
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
      // Auto-adjust end time to be 1 hour later if it's before start time
      const newEndTime = new Date(selectedTime);
      newEndTime.setTime(selectedTime.getTime() + 60 * 60 * 1000);
      if (endTime <= selectedTime) {
        setEndTime(newEndTime);
      }
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime && selectedTime > startTime) {
      setEndTime(selectedTime);
    } else if (selectedTime) {
      Alert.alert('Invalid Time', 'End time must be after start time');
    }
  };


  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCalendarAdded = (calendarId: string) => {
    Alert.alert('Success', 'Meeting created and added to your calendar!');
    setShowCalendarModal(false);
    setCreatedMeeting(null);
    handleClose();
  };

  const handleCalendarSkipped = () => {
    Alert.alert('Success', 'Meeting created successfully');
    setShowCalendarModal(false);
    setCreatedMeeting(null);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStartDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date(Date.now() + 60 * 60 * 1000));
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setType('GENERAL');
    setSelectedParticipants([]);
    setCustomParticipants([]);
    setNewParticipantEmail('');
    setAddToCalendar(true);
    setShowCalendarModal(false);
    setCreatedMeeting(null);
    onClose();
  };

  const toggleParticipant = (userId: number) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const addCustomParticipant = () => {
    const email = newParticipantEmail.trim();
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (customParticipants.includes(email)) {
      Alert.alert('Error', 'This participant is already added');
      return;
    }

    setCustomParticipants(prev => [...prev, email]);
    setNewParticipantEmail('');
  };

  const removeCustomParticipant = (email: string) => {
    setCustomParticipants(prev => prev.filter(p => p !== email));
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Meeting</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Meeting Title *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter meeting title"
                placeholderTextColor={theme.colors.textTertiary}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter meeting description"
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Meeting Type</Text>
              <View style={styles.typeSelector}>
                {meetingTypes.map((meetingType) => (
                  <TouchableOpacity
                    key={meetingType.value}
                    style={[
                      styles.typeOption,
                      type === meetingType.value && styles.typeOptionSelected
                    ]}
                    onPress={() => setType(meetingType.value)}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      type === meetingType.value && styles.typeOptionTextSelected
                    ]}>
                      {meetingType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Start Date *</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isLoading}
                >
                  <Calendar size={16} color={theme.colors.primary} />
                  <Text style={styles.dateTimeButtonText}>
                    {formatDate(startDate)}
                  </Text>
                  <ChevronDown size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Start Time *</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartTimePicker(true)}
                  disabled={isLoading}
                >
                  <Clock size={16} color={theme.colors.primary} />
                  <Text style={styles.dateTimeButtonText}>
                    {formatTime(startTime)}
                  </Text>
                  <ChevronDown size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndTimePicker(true)}
                disabled={isLoading}
              >
                <Clock size={16} color={theme.colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {formatTime(endTime)}
                </Text>
                <ChevronDown size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Participants</Text>
              
              {/* Add Custom Participant */}
              <View style={styles.addParticipantContainer}>
                <TextInput
                  style={[styles.textInput, { flex: 1, marginRight: 12 }]}
                  value={newParticipantEmail}
                  onChangeText={setNewParticipantEmail}
                  placeholder="Enter participant email"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addCustomParticipant}
                  disabled={isLoading}
                >
                  <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Custom Participants List */}
              {customParticipants.length > 0 && (
                <View style={styles.customParticipantsList}>
                  <Text style={styles.participantSectionTitle}>Added Participants</Text>
                  {customParticipants.map((email, index) => (
                    <View key={index} style={styles.customParticipantItem}>
                      <Text style={styles.customParticipantEmail}>{email}</Text>
                      <TouchableOpacity
                        onPress={() => removeCustomParticipant(email)}
                        style={styles.removeButton}
                        disabled={isLoading}
                      >
                        <X size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Existing Users List */}
              {allUsers.length > 0 && (
                <View style={styles.existingUsersList}>
                  <Text style={styles.participantSectionTitle}>Select from Contacts</Text>
                  <ScrollView style={styles.participantsList} nestedScrollEnabled>
                    {allUsers.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.participantItem}
                        onPress={() => toggleParticipant(user.id)}
                        disabled={isLoading}
                      >
                        <View style={styles.participantInfo}>
                          <Text style={styles.participantName}>{user.name}</Text>
                          <Text style={styles.participantEmail}>{user.email}</Text>
                        </View>
                        <View style={[
                          styles.checkbox,
                          selectedParticipants.includes(user.id) && styles.checkboxSelected
                        ]}>
                          {selectedParticipants.includes(user.id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calendar Integration</Text>
              <TouchableOpacity
                style={styles.calendarToggleContainer}
                onPress={() => setAddToCalendar(prev => !prev)}
                disabled={isLoading}
              >
                <View style={styles.calendarToggleInfo}>
                  <Calendar size={20} color={theme.colors.primary} />
                  <View style={styles.calendarToggleText}>
                    <Text style={styles.calendarToggleTitle}>Add to Calendar</Text>
                    <Text style={styles.calendarToggleDescription}>
                      Automatically open calendar picker after creating meeting
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  addToCalendar && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleSwitchThumb,
                    addToCalendar && styles.toggleSwitchThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, isLoading && styles.createButtonDisabled]} 
              onPress={handleCreateMeeting}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating...' : 'Create Meeting'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal transparent visible={showDatePicker} animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
                style={styles.picker}
                themeVariant={theme.isDark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Start Time Picker Modal */}
      {showStartTimePicker && (
        <Modal transparent visible={showStartTimePicker} animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Select Start Time</Text>
                <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={onStartTimeChange}
                style={styles.picker}
                themeVariant={theme.isDark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* End Time Picker Modal */}
      {showEndTimePicker && (
        <Modal transparent visible={showEndTimePicker} animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Select End Time</Text>
                <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={onEndTimeChange}
                style={styles.picker}
                themeVariant={theme.isDark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Calendar Integration Modal */}
      {createdMeeting && (
        <CalendarPickerModal
          visible={showCalendarModal}
          onClose={handleCalendarSkipped}
          meeting={{
            id: createdMeeting.id?.toString(),
            meetingId: createdMeeting.meetingId,
            title: createdMeeting.title,
            description: createdMeeting.description,
            startTime: createdMeeting.startTime,
            endTime: createdMeeting.endTime,
          }}
          onAddToCalendar={handleCalendarAdded}
        />
      )}
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
    maxWidth: 500,
    maxHeight: '90%',
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
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  typeOptionTextSelected: {
    color: '#ffffff',
  },
  participantsList: {
    maxHeight: 150,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  toggleButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
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
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  calendarToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  calendarToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarToggleText: {
    marginLeft: 12,
    flex: 1,
  },
  calendarToggleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginBottom: 2,
  },
  calendarToggleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleSwitchThumbActive: {
    alignSelf: 'flex-end',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  customParticipantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  customParticipantInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    paddingVertical: 0,
    paddingHorizontal: 8,
    borderWidth: 0,
  },
  addParticipantButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pickerCancelText: {
    fontSize: 16,
    color: theme.colors.error,
    fontWeight: '500',
  },
  pickerDoneText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  picker: {
    height: 200,
    backgroundColor: 'transparent',
  },
  // Participant styles
  addParticipantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customParticipantsList: {
    marginBottom: 16,
  },
  customParticipantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  customParticipantEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  participantSectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  existingUsersList: {
    marginTop: 8,
  },
});