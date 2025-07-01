import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { FileText, Download, Share, Users, CreditCard as Edit3, Save, X, Plus, Trash2, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SharedNotesProps {
  visible: boolean;
  onClose: () => void;
}

interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  isEditing?: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export function SharedNotesComponent({ visible, onClose }: SharedNotesProps) {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: '# Meeting Notes - Q1 Planning\n\n## Agenda\n- Review Q4 performance\n- Set Q1 goals\n- Resource allocation\n\n## Key Points\n- Revenue increased by 15% in Q4\n- Need to hire 2 more developers\n- Marketing budget approved for Q1',
      author: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '2',
      content: '## Action Items\n- [ ] Finalize hiring plan by Friday\n- [ ] Create Q1 roadmap\n- [ ] Schedule team building event\n- [x] Review budget proposals',
      author: 'Mike Johnson',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
  ]);

  const [collaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Sarah Wilson', color: '#4FC3F7', isActive: true },
    { id: '2', name: 'Mike Johnson', color: '#4CAF50', isActive: true },
    { id: '3', name: 'Emma Davis', color: '#FF9800', isActive: false },
    { id: '4', name: 'You', color: '#9C27B0', isActive: true },
  ]);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent,
        author: 'You',
        timestamp: new Date(),
      };
      setNotes(prev => [...prev, newNote]);
      setNewNoteContent('');
      setShowAddNote(false);
    }
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNoteId(noteId);
      setEditContent(note.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingNoteId) {
      setNotes(prev => prev.map(note => 
        note.id === editingNoteId 
          ? { ...note, content: editContent, timestamp: new Date() }
          : note
      ));
      setEditingNoteId(null);
      setEditContent('');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setNotes(prev => prev.filter(note => note.id !== noteId))
        },
      ]
    );
  };

  const handleExport = () => {
    // In a real app, this would export the notes
    Alert.alert('Export', 'Notes exported successfully!');
  };

  const handleShare = () => {
    // In a real app, this would share the notes
    Alert.alert('Share', 'Share link copied to clipboard!');
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for demo purposes
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={styles.heading1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.heading2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('- [ ]')) {
        return (
          <Text key={index} style={styles.todoItem}>
            ☐ {line.substring(5)}
          </Text>
        );
      } else if (line.startsWith('- [x]')) {
        return (
          <Text key={index} style={[styles.todoItem, styles.todoCompleted]}>
            ☑ {line.substring(5)}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        return (
          <Text key={index} style={styles.bulletItem}>
            • {line.substring(2)}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={styles.normalText}>
            {line}
          </Text>
        );
      }
    });
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Shared Notes</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
              <Download size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Collaborators Bar */}
        <View style={styles.collaboratorsBar}>
          <View style={styles.collaboratorsList}>
            <Users size={16} color={theme.colors.textSecondary} />
            <Text style={styles.collaboratorsLabel}>Active:</Text>
            {collaborators.filter(c => c.isActive).map((collaborator) => (
              <View key={collaborator.id} style={styles.collaboratorBadge}>
                <View style={[styles.collaboratorDot, { backgroundColor: collaborator.color }]} />
                <Text style={styles.collaboratorName}>{collaborator.name}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.addNoteButton}
            onPress={() => setShowAddNote(true)}
          >
            <Plus size={16} color={theme.colors.primary} />
            <Text style={styles.addNoteText}>Add Note</Text>
          </TouchableOpacity>
        </View>

        {/* Notes List */}
        <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
          {notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={styles.noteAuthor}>
                  <View style={[
                    styles.authorDot, 
                    { backgroundColor: collaborators.find(c => c.name === note.author)?.color || theme.colors.primary }
                  ]} />
                  <Text style={styles.authorName}>{note.author}</Text>
                  <Clock size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.timestamp}>{formatTimestamp(note.timestamp)}</Text>
                </View>
                <View style={styles.noteActions}>
                  <TouchableOpacity 
                    style={styles.noteAction}
                    onPress={() => handleEditNote(note.id)}
                  >
                    <Edit3 size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.noteAction}
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {editingNoteId === note.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editContent}
                    onChangeText={setEditContent}
                    multiline
                    placeholder="Edit note..."
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setEditingNoteId(null)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleSaveEdit}
                    >
                      <Save size={16} color="#ffffff" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.noteContent}>
                  {renderMarkdown(note.content)}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Add Note Modal */}
        <Modal
          visible={showAddNote}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddNote(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Note</Text>
                <TouchableOpacity onPress={() => setShowAddNote(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Note Content</Text>
                <TextInput
                  style={styles.noteInput}
                  value={newNoteContent}
                  onChangeText={setNewNoteContent}
                  multiline
                  placeholder="Type your note here... (Supports Markdown)"
                  placeholderTextColor={theme.colors.textTertiary}
                  textAlignVertical="top"
                />
                
                <View style={styles.markdownHint}>
                  <Text style={styles.hintText}>
                    Tip: Use # for headings, - for bullets, - [ ] for todos
                  </Text>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowAddNote(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddNote}
                  >
                    <Text style={styles.addButtonText}>Add Note</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 8,
  },
  collaboratorsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  collaboratorsList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collaboratorsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  collaboratorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  collaboratorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  collaboratorName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  notesList: {
    flex: 1,
    padding: 20,
  },
  noteCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  authorName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noteAction: {
    padding: 4,
  },
  noteContent: {
    gap: 8,
  },
  heading1: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginVertical: 8,
  },
  heading2: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginVertical: 6,
  },
  normalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    lineHeight: 20,
  },
  bulletItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    lineHeight: 20,
    marginLeft: 8,
  },
  todoItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    lineHeight: 20,
    marginLeft: 8,
  },
  todoCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
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
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  markdownHint: {
    marginTop: 8,
    marginBottom: 20,
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});