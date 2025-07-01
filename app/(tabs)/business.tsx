import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, Users, Calendar, Clock, FileText, Target, TrendingUp, Settings, Share, Download, Upload, MessageSquare, Video, Phone, X, Plus, CreditCard as Edit3, ChartBar as BarChart3, Shield, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function BusinessScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  
  // Business states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showActionItems, setShowActionItems] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoRecording, setAutoRecording] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // Meeting templates
  const meetingTemplates = [
    { id: '1', name: '1:1 Check-in', duration: '30 min', agenda: ['Personal updates', 'Goal progress', 'Blockers', 'Next steps'] },
    { id: '2', name: 'Team Standup', duration: '15 min', agenda: ['Yesterday\'s work', 'Today\'s plan', 'Blockers', 'Announcements'] },
    { id: '3', name: 'Brainstorm Session', duration: '60 min', agenda: ['Problem definition', 'Idea generation', 'Evaluation', 'Action planning'] },
    { id: '4', name: 'Project Review', duration: '45 min', agenda: ['Progress update', 'Challenges', 'Solutions', 'Timeline adjustment'] },
    { id: '5', name: 'Client Presentation', duration: '60 min', agenda: ['Introduction', 'Proposal overview', 'Q&A', 'Next steps'] },
  ];

  // Action items
  const [actionItems, setActionItems] = useState([
    { id: '1', task: 'Update project timeline', assignee: 'Sarah Wilson', dueDate: '2024-01-15', status: 'pending' },
    { id: '2', task: 'Prepare client proposal', assignee: 'Mike Johnson', dueDate: '2024-01-12', status: 'in-progress' },
    { id: '3', task: 'Review budget allocation', assignee: 'Emma Davis', dueDate: '2024-01-10', status: 'completed' },
  ]);

  // Analytics data
  const analyticsData = {
    totalMeetings: 47,
    avgDuration: '32 min',
    participationRate: 89,
    actionItemsCompleted: 76,
    weeklyTrend: '+12%',
    topParticipants: [
      { name: 'Sarah Wilson', meetings: 12, engagement: 94 },
      { name: 'Mike Johnson', meetings: 10, engagement: 87 },
      { name: 'Emma Davis', meetings: 9, engagement: 91 },
    ]
  };

  // Recent recordings
  const recentRecordings = [
    { id: '1', title: 'Q4 Planning Meeting', date: '2024-01-08', duration: '45 min', size: '120 MB' },
    { id: '2', title: 'Client Presentation - Acme Corp', date: '2024-01-07', duration: '60 min', size: '180 MB' },
    { id: '3', title: 'Team Standup', date: '2024-01-06', duration: '15 min', size: '45 MB' },
  ];

  const handleUseTemplate = (templateId: string) => {
    const template = meetingTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template.name);
      setShowTemplateModal(false);
      // In a real app, this would create a meeting with the template
      console.log('Using template:', template.name);
    }
  };

  const handleAddActionItem = () => {
    const newItem = {
      id: Date.now().toString(),
      task: 'New action item',
      assignee: 'Unassigned',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setActionItems([...actionItems, newItem]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'in-progress':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Hub</Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowAnalytics(true)}
          >
            <BarChart3 size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => setShowTemplateModal(true)}
              >
                <Briefcase color={theme.colors.primary} size={24} />
                <Text style={styles.actionText}>Meeting Templates</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => setShowActionItems(true)}
              >
                <Target color={theme.colors.primary} size={24} />
                <Text style={styles.actionText}>Action Items</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{actionItems.filter(item => item.status !== 'completed').length}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <FileText color={theme.colors.primary} size={24} />
                <Text style={styles.actionText}>Meeting Notes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <Share color={theme.colors.primary} size={24} />
                <Text style={styles.actionText}>Share Reports</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Meeting Productivity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meeting Productivity</Text>
            <View style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <Text style={styles.productivityTitle}>This Week's Overview</Text>
                <View style={styles.trendIndicator}>
                  <TrendingUp size={16} color={theme.colors.success} />
                  <Text style={styles.trendText}>{analyticsData.weeklyTrend}</Text>
                </View>
              </View>
              
              <View style={styles.metricsGrid}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{analyticsData.totalMeetings}</Text>
                  <Text style={styles.metricLabel}>Total Meetings</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{analyticsData.avgDuration}</Text>
                  <Text style={styles.metricLabel}>Avg Duration</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{analyticsData.participationRate}%</Text>
                  <Text style={styles.metricLabel}>Participation</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{analyticsData.actionItemsCompleted}%</Text>
                  <Text style={styles.metricLabel}>Actions Done</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Auto Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Automation</Text>
            <View style={styles.autoFeatures}>
              <View style={styles.autoFeature}>
                <View style={styles.autoFeatureInfo}>
                  <Zap color={theme.colors.primary} size={20} />
                  <View style={styles.autoFeatureText}>
                    <Text style={styles.autoFeatureName}>Auto Recording</Text>
                    <Text style={styles.autoFeatureDesc}>Automatically record and save meetings</Text>
                  </View>
                </View>
                <Switch
                  value={autoRecording}
                  onValueChange={setAutoRecording}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
              
              <View style={styles.autoFeature}>
                <View style={styles.autoFeatureInfo}>
                  <MessageSquare color={theme.colors.primary} size={20} />
                  <View style={styles.autoFeatureText}>
                    <Text style={styles.autoFeatureName}>AI Meeting Summary</Text>
                    <Text style={styles.autoFeatureDesc}>Generate summaries and action items</Text>
                  </View>
                </View>
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
              
              <View style={styles.autoFeature}>
                <View style={styles.autoFeatureInfo}>
                  <Calendar color={theme.colors.primary} size={20} />
                  <View style={styles.autoFeatureText}>
                    <Text style={styles.autoFeatureName}>Calendar Sync</Text>
                    <Text style={styles.autoFeatureDesc}>Sync with Google Calendar & Outlook</Text>
                  </View>
                </View>
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Recent Recordings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Recordings</Text>
            {recentRecordings.map((recording) => (
              <View key={recording.id} style={styles.recordingCard}>
                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingTitle}>{recording.title}</Text>
                  <Text style={styles.recordingMeta}>
                    {recording.date} • {recording.duration} • {recording.size}
                  </Text>
                </View>
                <View style={styles.recordingActions}>
                  <TouchableOpacity style={styles.recordingAction}>
                    <Download size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.recordingAction}>
                    <Share size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Team Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Participants</Text>
            {analyticsData.topParticipants.map((participant, index) => (
              <View key={index} style={styles.participantCard}>
                <View style={styles.participantRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantStats}>
                    {participant.meetings} meetings • {participant.engagement}% engagement
                  </Text>
                </View>
                <View style={styles.engagementBar}>
                  <View 
                    style={[
                      styles.engagementFill, 
                      { width: `${participant.engagement}%`, backgroundColor: theme.colors.primary }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Meeting Templates Modal */}
        <Modal
          visible={showTemplateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTemplateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Meeting Templates</Text>
                <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.templatesList}>
                {meetingTemplates.map((template) => (
                  <TouchableOpacity 
                    key={template.id} 
                    style={styles.templateCard}
                    onPress={() => handleUseTemplate(template.id)}
                  >
                    <View style={styles.templateInfo}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateDuration}>{template.duration}</Text>
                      <View style={styles.templateAgenda}>
                        {template.agenda.map((item, index) => (
                          <Text key={index} style={styles.agendaItem}>• {item}</Text>
                        ))}
                      </View>
                    </View>
                    <TouchableOpacity style={styles.useTemplateButton}>
                      <Text style={styles.useTemplateText}>Use Template</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Action Items Modal */}
        <Modal
          visible={showActionItems}
          transparent
          animationType="slide"
          onRequestClose={() => setShowActionItems(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Action Items</Text>
                <View style={styles.modalHeaderActions}>
                  <TouchableOpacity onPress={handleAddActionItem} style={styles.addButton}>
                    <Plus size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowActionItems(false)}>
                    <X size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={styles.actionItemsList}>
                {actionItems.map((item) => (
                  <View key={item.id} style={styles.actionItemCard}>
                    <View style={styles.actionItemInfo}>
                      <Text style={styles.actionItemTask}>{item.task}</Text>
                      <Text style={styles.actionItemMeta}>
                        {item.assignee} • Due: {item.dueDate}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Analytics Modal */}
        <Modal
          visible={showAnalytics}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAnalytics(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Meeting Analytics</Text>
                <TouchableOpacity onPress={() => setShowAnalytics(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.analyticsContent}>
                <View style={styles.analyticsSection}>
                  <Text style={styles.analyticsSectionTitle}>Meeting Frequency</Text>
                  <View style={styles.chartPlaceholder}>
                    <BarChart3 size={48} color={theme.colors.primary} />
                    <Text style={styles.chartText}>Weekly meeting trends</Text>
                  </View>
                </View>
                
                <View style={styles.analyticsSection}>
                  <Text style={styles.analyticsSectionTitle}>Participation Insights</Text>
                  <View style={styles.insightsList}>
                    <Text style={styles.insightItem}>• Average speaking time: 4.2 minutes</Text>
                    <Text style={styles.insightItem}>• Most active time: 10-11 AM</Text>
                    <Text style={styles.insightItem}>• Camera usage: 87% of meetings</Text>
                    <Text style={styles.insightItem}>• Action item completion: 76%</Text>
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  analyticsButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrollView: {
    flex: 1,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '22%',
    position: 'relative',
  },
  actionText: {
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
  productivityCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  productivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productivityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.success,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  autoFeatures: {
    gap: 16,
  },
  autoFeature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  autoFeatureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  autoFeatureText: {
    flex: 1,
  },
  autoFeatureName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  autoFeatureDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  recordingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  recordingMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  recordingAction: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 8,
  },
  participantCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  participantRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  participantStats: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  engagementBar: {
    width: 60,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  engagementFill: {
    height: '100%',
    borderRadius: 3,
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
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 8,
  },
  templatesList: {
    maxHeight: 500,
    padding: 20,
  },
  templateCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  templateInfo: {
    marginBottom: 16,
  },
  templateName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  templateAgenda: {
    gap: 4,
  },
  agendaItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  useTemplateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  useTemplateText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  actionItemsList: {
    maxHeight: 400,
    padding: 20,
  },
  actionItemCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionItemInfo: {
    flex: 1,
  },
  actionItemTask: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  actionItemMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  analyticsContent: {
    padding: 20,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  chartPlaceholder: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chartText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});