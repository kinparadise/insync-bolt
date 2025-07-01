import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Phone, Video, MessageCircle, UserPlus, X, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function ContactsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const contacts = [
    {
      id: '1',
      name: 'Emily Johnson',
      email: 'emily@company.com',
      status: 'online',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      department: 'Design',
      lastSeen: 'Active now',
    },
    {
      id: '2',
      name: 'Jason Miller',
      email: 'jason@company.com',
      status: 'away',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      department: 'Engineering',
      lastSeen: '5 minutes ago',
    },
    {
      id: '3',
      name: 'Megan Davis',
      email: 'megan@company.com',
      status: 'offline',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      department: 'Marketing',
      lastSeen: '2 hours ago',
    },
    {
      id: '4',
      name: 'Alex Thompson',
      email: 'alex@company.com',
      status: 'online',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      department: 'Product',
      lastSeen: 'Active now',
    },
    {
      id: '5',
      name: 'Sarah Wilson',
      email: 'sarah@company.com',
      status: 'busy',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      department: 'Sales',
      lastSeen: 'In a meeting',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.colors.success;
      case 'away':
        return theme.colors.warning;
      case 'busy':
        return theme.colors.error;
      default:
        return theme.colors.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartCall = (contactId: string, isVideo: boolean = false) => {
    const callId = `call-${contactId}-${Date.now()}`;
    router.push(`/call/${callId}`);
  };

  const handleSendInvite = () => {
    if (inviteEmail.trim()) {
      // Here you would typically send the invitation
      console.log('Sending invite to:', inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowInviteModal(true)}
          >
            <UserPlus color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color={theme.colors.textTertiary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.contactsList}>
            {filteredContacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: contact.avatar }} style={styles.avatar} />
                    <View 
                      style={[
                        styles.statusIndicator, 
                        { backgroundColor: getStatusColor(contact.status) }
                      ]} 
                    />
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactEmail}>{contact.email}</Text>
                    <View style={styles.contactMeta}>
                      <Text style={styles.contactDepartment}>{contact.department}</Text>
                      <Text style={styles.contactStatus}>
                        {getStatusText(contact.status)} • {contact.lastSeen}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {/* Handle chat */}}
                  >
                    <MessageCircle color={theme.colors.primary} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleStartCall(contact.id, false)}
                  >
                    <Phone color={theme.colors.primary} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleStartCall(contact.id, true)}
                  >
                    <Video color={theme.colors.primary} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {filteredContacts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No contacts found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or invite new contacts
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Invite Modal */}
        <Modal
          visible={showInviteModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowInviteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Invite Contact</Text>
                <TouchableOpacity 
                  onPress={() => setShowInviteModal(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Send an invitation to join your team on InSync
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.emailInputContainer}>
                    <Mail size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={styles.emailInput}
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                      placeholder="Enter email address"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowInviteModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.inviteButton}
                    onPress={handleSendInvite}
                  >
                    <Text style={styles.inviteButtonText}>Send Invite</Text>
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  contactsList: {
    paddingHorizontal: 24,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactDepartment: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contactStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
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
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
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
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    marginLeft: 12,
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
  inviteButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});