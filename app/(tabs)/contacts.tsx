import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Modal, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Phone, Video, MessageCircle, UserPlus, X, Mail, Send, Check, CheckCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { AnimatedBackgroundCircle } from '@/components/AnimatedBackgroundCircle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import * as Contacts from 'expo-contacts';
import dayjs from 'dayjs';

export default function ContactsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const insets = useSafeAreaInsets();
  const { height: deviceHeight } = Dimensions.get('window');
  const usableHeight = deviceHeight - insets.top - insets.bottom;
  const [showDeviceContactsModal, setShowDeviceContactsModal] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<any[]>([]);
  const [selectedDeviceContacts, setSelectedDeviceContacts] = useState<string[]>([]);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<ContactType[]>([
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
  ]);

  type ContactType = {
    id: string;
    name: string;
    email: string;
    status: string;
    avatar?: string;
    department: string;
    lastSeen: string;
    phone?: string;
  };

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

  // Fetch device contacts
  const handleImportDeviceContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image] });
      setDeviceContacts(data);
      setShowDeviceContactsModal(true);
    }
  };

  // Toggle selection
  const toggleDeviceContact = (id: string) => {
    setSelectedDeviceContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Add selected device contacts to in-app contacts
  const handleAddSelectedDeviceContacts = () => {
    const toAdd = deviceContacts.filter((c) => selectedDeviceContacts.includes(c.id)).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.emails?.[0]?.email || '',
      status: 'offline',
      avatar: c.imageAvailable && c.image ? c.image.uri : undefined,
      department: '',
      lastSeen: '',
      phone: c.phoneNumbers?.[0]?.number || '',
    }));
    setContacts((prev) => [...prev, ...toAdd]);
    setShowDeviceContactsModal(false);
    setSelectedDeviceContacts([]);
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={{ ...styles.container, height: usableHeight }}>
      <AnimatedBackgroundCircle height={usableHeight} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.addButton} onPress={handleImportDeviceContacts}>
              <UserPlus color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowInviteModal(true)}>
              <Mail color="#fff" size={24} />
            </TouchableOpacity>
          </View>
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
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => { setSelectedContact(contact); setShowContactDetails(true); }}
                activeOpacity={0.85}
              >
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
                    onPress={() => router.push({ pathname: '/auth/chat/[id]', params: { id: contact.id } })}
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
              </TouchableOpacity>
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

        {/* Device Contacts Modal */}
        <Modal
          visible={showDeviceContactsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDeviceContactsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Contacts</Text>
                <TouchableOpacity onPress={() => setShowDeviceContactsModal(false)} style={styles.modalClose}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 350 }}>
                {deviceContacts.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                    onPress={() => toggleDeviceContact(c.id)}
                  >
                    <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: theme.colors.primary, marginRight: 12, backgroundColor: selectedDeviceContacts.includes(c.id) ? theme.colors.primary : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                      {selectedDeviceContacts.includes(c.id) && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                    </View>
                    <Image source={c.imageAvailable && c.image ? { uri: c.image.uri } : require('../../assets/images/icon.png')} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
                    <View>
                      <Text style={{ color: theme.colors.text, fontSize: 16 }}>{c.name}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{c.emails?.[0]?.email || ''}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDeviceContactsModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.inviteButton} onPress={handleAddSelectedDeviceContacts}>
                  <Text style={styles.inviteButtonText}>Add Selected</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Contact Details Modal */}
        <Modal
          visible={showContactDetails}
          transparent
          animationType="slide"
          onRequestClose={() => setShowContactDetails(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Contact Details</Text>
                <TouchableOpacity onPress={() => setShowContactDetails(false)} style={styles.modalClose}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {selectedContact && (
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <Image source={selectedContact.avatar ? { uri: selectedContact.avatar } : require('../../assets/images/icon.png')} style={{ width: 72, height: 72, borderRadius: 36, marginBottom: 12 }} />
                  <Text style={{ fontSize: 20, color: theme.colors.text, fontWeight: 'bold', marginBottom: 4 }}>{selectedContact.name}</Text>
                  <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>{selectedContact.email}</Text>
                  {selectedContact.phone && <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>{selectedContact.phone}</Text>}
                  <Text style={{ color: theme.colors.primary, marginBottom: 8 }}>{selectedContact.department}</Text>
                  <Text style={{ color: theme.colors.textTertiary, marginBottom: 8 }}>{getStatusText(selectedContact.status)} • {selectedContact.lastSeen}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleStartCall(selectedContact.id, false)}>
                      <Phone color={theme.colors.primary} size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleStartCall(selectedContact.id, true)}>
                      <Video color={theme.colors.primary} size={22} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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