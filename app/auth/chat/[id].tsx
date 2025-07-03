import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { X, Send, Check, CheckCheck, ArrowLeft, Info } from 'lucide-react-native';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import dayjs from 'dayjs';

const mockContacts = [
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

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const router = useRouter();
  const [chatInput, setChatInput] = useState('');
  const [replyTo, setReplyTo] = useState<null | { text: string; from: string }>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<{ idx: number; visible: boolean }>({ idx: -1, visible: false });
  const emojiOptions = ['👍', '😂', '❤️', '😮', '😢', '👏'];
  const [showInstructions, setShowInstructions] = useState(false);

  // Find the contact by id
  const chatContact = mockContacts.find((c) => c.id === id) || mockContacts[0];

  type ChatMessage = {
    from: 'me' | 'them';
    text: string;
    time: string;
    status?: 'sent' | 'delivered' | 'seen';
    reactions?: string[];
    replyTo?: { text: string; from: string } | null;
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Initialize with mock messages
    const now = dayjs();
    setChatMessages([
      { from: 'them', text: `Hi 👋, this is ${chatContact.name}!`, time: now.subtract(2, 'minute').format('h:mm A') },
      { from: 'me', text: 'Hello! 😊', time: now.subtract(1, 'minute').format('h:mm A'), status: 'seen' },
    ]);
  }, [id]);

  const handleSendChatMessage = () => {
    if (chatInput.trim()) {
      setChatMessages((prev) => [
        ...prev,
        {
          from: 'me',
          text: chatInput.trim(),
          time: dayjs().format('h:mm A'),
          status: 'sent',
          replyTo: replyTo ? { ...replyTo } : null,
        },
      ]);
      setChatInput('');
      setReplyTo(null);
    }
  };

  const shouldShowAvatar = (messages: typeof chatMessages, idx: number) => {
    if (idx === 0) return true;
    return messages[idx].from !== messages[idx - 1].from;
  };

  const handleAddReaction = (idx: number, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((msg, i) =>
        i === idx
          ? { ...msg, reactions: msg.reactions ? [...msg.reactions, emoji] : [emoji] }
          : msg
      )
    );
    setShowEmojiPicker({ idx: -1, visible: false });
  };

  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/contacts' as any)} style={styles.backButton}>
          <ArrowLeft size={26} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Image source={chatContact?.avatar ? { uri: chatContact.avatar } : require('../../../assets/images/icon.png')} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{chatContact?.name}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowInstructions(true)} style={{ marginLeft: 8 }}>
          <Info size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Instructions Modal */}
      {showInstructions && (
        <Pressable style={styles.instructionsOverlay} onPress={() => setShowInstructions(false)}>
          <View
            style={styles.instructionsModal}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>How to use chat</Text>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  setShowInstructions(false);
                }}
                style={{ padding: 4 }}
              >
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 15, marginBottom: 10 }}>
              • <Text style={{ fontWeight: 'bold' }}>Reply:</Text> Long-press any message to reply to it.
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 15, marginBottom: 10 }}>
              • <Text style={{ fontWeight: 'bold' }}>React:</Text> Tap a message to open the emoji picker and select a reaction.
            </Text>
            <Text style={{ color: theme.colors.textTertiary, fontSize: 13 }}>
              You can reply to and react to any message in the chat. Try it out!
            </Text>
          </View>
        </Pressable>
      )}
      {/* Chat Messages */}
      <View style={styles.messagesContainer}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map((msg, idx) => {
            const isMe = msg.from === 'me';
            const showAvatar = shouldShowAvatar(chatMessages, idx);
            const recipientColor = '#e6f4';
            const senderColor = theme.colors.primary;
            const isLastMe = isMe && idx === chatMessages.map(m => m.from).lastIndexOf('me');
            return (
              <View key={idx} style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: 2, marginTop: showAvatar ? 10 : 2 }}>
                {showAvatar ? (
                  <Image
                    source={isMe ? require('../../../assets/images/icon.png') : (chatContact?.avatar ? { uri: chatContact.avatar } : require('../../../assets/images/icon.png'))}
                    style={{ width: 28, height: 28, borderRadius: 14, marginHorizontal: 6, marginBottom: 2 }}
                  />
                ) : (
                  <View style={{ width: 28, marginHorizontal: 6 }} />
                )}
                <View style={{ maxWidth: '75%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <Pressable
                    onPress={() => setShowEmojiPicker({ idx, visible: true })}
                    onLongPress={() => setReplyTo({ text: msg.text, from: isMe ? 'You' : chatContact?.name || 'Contact' })}
                    style={{ width: '100%' }}
                  >
                    <View style={{
                      backgroundColor: isMe ? senderColor : recipientColor,
                      borderRadius: 18,
                      borderBottomRightRadius: isMe ? 6 : 18,
                      borderBottomLeftRadius: isMe ? 18 : 6,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      marginBottom: 2,
                      shadowColor: isMe ? theme.colors.primary : '#000',
                      shadowOpacity: 0.06,
                      shadowRadius: 2,
                      elevation: 1,
                    }}>
                      {!isMe && showAvatar && (
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 2 }}>{chatContact?.name}</Text>
                      )}
                      {msg.replyTo && (
                        <View style={{ borderLeftWidth: 3, borderLeftColor: '#bbb', paddingLeft: 8, marginBottom: 4 }}>
                          <Text style={{ color: '#eee', fontSize: 12 }}>{msg.replyTo.from}:</Text>
                          <Text style={{ color: '#eee', fontSize: 13, fontStyle: 'italic' }} numberOfLines={1}>{msg.replyTo.text}</Text>
                        </View>
                      )}
                      <Text style={{ color: isMe ? '#fff' : theme.colors.text, fontSize: 15 }}>{msg.text}</Text>
                      {isLastMe && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, alignSelf: 'flex-end' }}>
                          {msg.status === 'sent' && <Check size={16} color={'#fff'} style={{ marginRight: 2 }} />}
                          {msg.status === 'delivered' && <CheckCheck size={16} color={'#fff'} style={{ marginRight: 2 }} />}
                          {msg.status === 'seen' && <CheckCheck size={16} color={theme.colors.success} style={{ marginRight: 2 }} />}
                          <Text style={{ color: '#fff', fontSize: 11 }}>{msg.status}</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                  {/* Emoji reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 2, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                      {msg.reactions.map((emoji, i) => (
                        <Text key={i} style={{ fontSize: 18 }}>{emoji}</Text>
                      ))}
                    </View>
                  )}
                  {/* Emoji picker */}
                  {showEmojiPicker.visible && showEmojiPicker.idx === idx && (
                    <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 6, marginTop: 4, alignSelf: isMe ? 'flex-end' : 'flex-start', elevation: 2 }}>
                      {emojiOptions.map((emoji) => (
                        <Pressable key={emoji} onPress={() => handleAddReaction(idx, emoji)} style={{ marginHorizontal: 4 }}>
                          <Text style={{ fontSize: 22 }}>{emoji}</Text>
                        </Pressable>
                      ))}
                      <Pressable onPress={() => setShowEmojiPicker({ idx: -1, visible: false })} style={{ marginLeft: 8 }}>
                        <Text style={{ fontSize: 18, color: '#888' }}>×</Text>
                      </Pressable>
                    </View>
                  )}
                  <Text style={{ color: theme.colors.textTertiary, fontSize: 11, marginTop: 1, marginBottom: 2, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>{msg.time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      {/* Chat Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {replyTo && (
          <View style={styles.replyToContainer}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginRight: 6 }}>{replyTo.from}:</Text>
            <Text style={{ color: theme.colors.text, flex: 1 }} numberOfLines={1}>{replyTo.text}</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)} style={{ marginLeft: 8 }}>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textTertiary}
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={handleSendChatMessage}
            returnKeyType="send"
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendChatMessage}>
            <Send size={18} color="#fff" style={{ margin: 2, marginLeft: 15, marginRight: 15 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedLinearGradient>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop:50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    gap: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  contactStatus: {
    fontSize: 13,
    color: theme.colors.success,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface + '10',
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  replyToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: 8,
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: 12,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    minHeight: 44,
    maxHeight: 120,
  },
  sendButton: {
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsModal: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
}); 