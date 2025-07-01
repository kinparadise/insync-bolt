import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Hand, Mic, MicOff, Video, VideoOff, Monitor, MessageCircle, Clock, BookOpen, Target, SquareCheck as CheckSquare, X, Plus, CreditCard as Edit3, ChartBar as BarChart3, Settings, Shield } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function ClassroomScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  
  // Classroom states
  const [isClassroomMode, setIsClassroomMode] = useState(false);
  const [isAutoAttendance, setIsAutoAttendance] = useState(true);
  const [showHandQueue, setShowHandQueue] = useState(false);
  const [showQuickPoll, setShowQuickPoll] = useState(false);
  const [showBreakoutSetup, setShowBreakoutSetup] = useState(false);
  const [showSessionGoals, setShowSessionGoals] = useState(false);
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Session goals
  const [sessionGoals, setSessionGoals] = useState([
    { id: '1', text: 'Review last week\'s assignment', completed: false },
    { id: '2', text: 'Introduce new concepts', completed: false },
    { id: '3', text: 'Q&A session', completed: false },
  ]);
  const [newGoal, setNewGoal] = useState('');

  // Hand queue
  const [handQueue] = useState([
    { id: '1', name: 'Sarah Wilson', time: '2 min ago', question: 'Can you explain the last concept again?' },
    { id: '2', name: 'Mike Johnson', time: '1 min ago', question: 'I have a question about the assignment' },
    { id: '3', name: 'Emma Davis', time: '30 sec ago', question: null },
  ]);

  // Attendance data
  const [attendanceData] = useState([
    { id: '1', name: 'Sarah Wilson', joinTime: '9:00 AM', status: 'present', participation: 85 },
    { id: '2', name: 'Mike Johnson', joinTime: '9:02 AM', status: 'present', participation: 72 },
    { id: '3', name: 'Emma Davis', joinTime: '9:01 AM', status: 'present', participation: 91 },
    { id: '4', name: 'Alex Chen', joinTime: '9:05 AM', status: 'late', participation: 68 },
    { id: '5', name: 'Lisa Brown', joinTime: null, status: 'absent', participation: 0 },
  ]);

  // Breakout groups
  const [breakoutGroups] = useState([
    { id: '1', name: 'Group A - Research Team', members: ['Sarah', 'Mike'], template: 'research' },
    { id: '2', name: 'Group B - Analysis Team', members: ['Emma', 'Alex'], template: 'analysis' },
    { id: '3', name: 'Group C - Presentation Team', members: ['Lisa', 'Tom'], template: 'presentation' },
  ]);

  const handleStartClassroom = () => {
    setIsClassroomMode(true);
    // In a real app, this would enable classroom controls
    Alert.alert('Classroom Mode', 'You now have full control over the session');
  };

  const handleMuteAll = () => {
    Alert.alert('All Muted', 'All participants have been muted');
  };

  const handleSpotlightStudent = (studentName: string) => {
    Alert.alert('Spotlight', `${studentName} is now in spotlight mode`);
  };

  const handleCreatePoll = () => {
    if (pollQuestion.trim() && pollOptions.every(opt => opt.trim())) {
      Alert.alert('Poll Created', 'Your poll has been sent to all participants');
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowQuickPoll(false);
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const goal = {
        id: Date.now().toString(),
        text: newGoal,
        completed: false,
      };
      setSessionGoals([...sessionGoals, goal]);
      setNewGoal('');
    }
  };

  const toggleGoalCompletion = (goalId: string) => {
    setSessionGoals(goals =>
      goals.map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const getParticipationColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Classroom</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.modeButton, isClassroomMode && styles.modeButtonActive]}
              onPress={handleStartClassroom}
            >
              <Shield size={20} color={isClassroomMode ? '#ffffff' : theme.colors.primary} />
              <Text style={[styles.modeButtonText, isClassroomMode && styles.modeButtonTextActive]}>
                {isClassroomMode ? 'Active' : 'Enable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Controls</Text>
            <View style={styles.quickControls}>
              <TouchableOpacity style={styles.controlCard} onPress={handleMuteAll}>
                <MicOff color={theme.colors.error} size={24} />
                <Text style={styles.controlText}>Mute All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlCard}
                onPress={() => setShowQuickPoll(true)}
              >
                <BarChart3 color={theme.colors.primary} size={24} />
                <Text style={styles.controlText}>Quick Poll</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlCard}
                onPress={() => setShowBreakoutSetup(true)}
              >
                <Users color={theme.colors.primary} size={24} />
                <Text style={styles.controlText}>Breakouts</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlCard}
                onPress={() => setShowHandQueue(true)}
              >
                <Hand color={theme.colors.warning} size={24} />
                <Text style={styles.controlText}>Hand Queue</Text>
                {handQueue.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{handQueue.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Session Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Session Goals</Text>
              <TouchableOpacity onPress={() => setShowSessionGoals(true)}>
                <Target color={theme.colors.primary} size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.goalsContainer}>
              {sessionGoals.slice(0, 3).map((goal) => (
                <TouchableOpacity 
                  key={goal.id} 
                  style={styles.goalItem}
                  onPress={() => toggleGoalCompletion(goal.id)}
                >
                  <CheckSquare 
                    color={goal.completed ? theme.colors.success : theme.colors.textTertiary} 
                    size={20} 
                  />
                  <Text style={[styles.goalText, goal.completed && styles.goalCompleted]}>
                    {goal.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Attendance Overview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Attendance & Participation</Text>
              <Switch
                value={isAutoAttendance}
                onValueChange={setIsAutoAttendance}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.attendanceGrid}>
              {attendanceData.map((student) => (
                <View key={student.id} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentStatus}>
                      {student.status === 'present' ? `Joined ${student.joinTime}` : 
                       student.status === 'late' ? `Late - ${student.joinTime}` : 'Absent'}
                    </Text>
                  </View>
                  <View style={styles.participationScore}>
                    <Text style={[styles.scoreText, { color: getParticipationColor(student.participation) }]}>
                      {student.participation}%
                    </Text>
                  </View>
                  {student.status === 'present' && (
                    <TouchableOpacity 
                      style={styles.spotlightButton}
                      onPress={() => handleSpotlightStudent(student.name)}
                    >
                      <Monitor size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Breakout Groups */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Breakout Groups</Text>
            {breakoutGroups.map((group) => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>
                    {group.members.join(', ')} • {group.template} template
                  </Text>
                </View>
                <TouchableOpacity style={styles.groupAction}>
                  <MessageCircle size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Learning Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Tools</Text>
            <View style={styles.toolsGrid}>
              <TouchableOpacity style={styles.toolCard}>
                <Edit3 color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Whiteboard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.toolCard}>
                <BookOpen color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Shared Notes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.toolCard}>
                <Clock color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Transcripts</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.toolCard}>
                <BarChart3 color={theme.colors.primary} size={24} />
                <Text style={styles.toolText}>Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Hand Queue Modal */}
        <Modal
          visible={showHandQueue}
          transparent
          animationType="slide"
          onRequestClose={() => setShowHandQueue(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Raised Hands Queue</Text>
                <TouchableOpacity onPress={() => setShowHandQueue(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.queueList}>
                {handQueue.map((item, index) => (
                  <View key={item.id} style={styles.queueItem}>
                    <View style={styles.queueNumber}>
                      <Text style={styles.queueNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.queueInfo}>
                      <Text style={styles.queueName}>{item.name}</Text>
                      <Text style={styles.queueTime}>{item.time}</Text>
                      {item.question && (
                        <Text style={styles.queueQuestion}>"{item.question}"</Text>
                      )}
                    </View>
                    <TouchableOpacity style={styles.queueAction}>
                      <Text style={styles.queueActionText}>Call On</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Quick Poll Modal */}
        <Modal
          visible={showQuickPoll}
          transparent
          animationType="slide"
          onRequestClose={() => setShowQuickPoll(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Quick Poll</Text>
                <TouchableOpacity onPress={() => setShowQuickPoll(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Question</Text>
                  <TextInput
                    style={styles.textInput}
                    value={pollQuestion}
                    onChangeText={setPollQuestion}
                    placeholder="What's your question?"
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                  />
                </View>
                
                {pollOptions.map((option, index) => (
                  <View key={index} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Option {index + 1}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={option}
                      onChangeText={(text) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = text;
                        setPollOptions(newOptions);
                      }}
                      placeholder={`Option ${index + 1}`}
                      placeholderTextColor={theme.colors.textTertiary}
                    />
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={styles.addOptionButton}
                  onPress={() => setPollOptions([...pollOptions, ''])}
                >
                  <Plus size={16} color={theme.colors.primary} />
                  <Text style={styles.addOptionText}>Add Option</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.createButton} onPress={handleCreatePoll}>
                  <Text style={styles.createButtonText}>Create Poll</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Session Goals Modal */}
        <Modal
          visible={showSessionGoals}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSessionGoals(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Session Goals</Text>
                <TouchableOpacity onPress={() => setShowSessionGoals(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <ScrollView style={styles.goalsList}>
                  {sessionGoals.map((goal) => (
                    <TouchableOpacity 
                      key={goal.id} 
                      style={styles.goalItemFull}
                      onPress={() => toggleGoalCompletion(goal.id)}
                    >
                      <CheckSquare 
                        color={goal.completed ? theme.colors.success : theme.colors.textTertiary} 
                        size={20} 
                      />
                      <Text style={[styles.goalTextFull, goal.completed && styles.goalCompleted]}>
                        {goal.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <View style={styles.addGoalContainer}>
                  <TextInput
                    style={styles.goalInput}
                    value={newGoal}
                    onChangeText={setNewGoal}
                    placeholder="Add a new goal..."
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                  <TouchableOpacity style={styles.addGoalButton} onPress={handleAddGoal}>
                    <Plus size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  quickControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  controlCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: '22%',
    position: 'relative',
  },
  controlText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  goalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    flex: 1,
  },
  goalCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  attendanceGrid: {
    gap: 12,
  },
  studentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  studentStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  participationScore: {
    marginRight: 12,
  },
  scoreText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  spotlightButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 8,
  },
  groupCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  groupAction: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 8,
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
    maxHeight: '80%',
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
  queueList: {
    maxHeight: 400,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  queueNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  queueInfo: {
    flex: 1,
  },
  queueName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  queueTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  queueQuestion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  queueAction: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  queueActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
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
    minHeight: 44,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  addOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  goalsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  goalItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  goalTextFull: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    flex: 1,
  },
  addGoalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  goalInput: {
    flex: 1,
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
  addGoalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});