import { Alert } from 'react-native';

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

export function startInAppCall(contact: InAppCallContact) {
  Alert.alert(
    'In-App Call',
    `Starting in-app audio call with ${contact.name}${contact.phone ? ' (' + contact.phone + ')' : ''}.`
  );
  // Future: Implement real VoIP/in-app call logic here
} 