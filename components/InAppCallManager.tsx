import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Placeholder types to avoid breaking imports elsewhere
export type InAppCallContact = {
  id: string;
  name: string;
  email: string;
  status: string;
  avatar?: string;
  department: string;
  lastSeen: string;
  phone?: string;
};

// Placeholder function
export function startInAppCall(contact: InAppCallContact) {
  // No-op: Agora functionality removed
  // Optionally show a message or do nothing
}

// Placeholder component
export function InAppCallScreen({ channelName, contact, onEnd }: {
  channelName: string;
  contact: InAppCallContact;
  onEnd: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>In-App Call Unavailable</Text>
      <Text style={styles.subtitle}>In-app calling is currently disabled.</Text>
      <Button title="Close" onPress={onEnd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { color: '#fff', fontSize: 16, marginBottom: 32 },
}); 