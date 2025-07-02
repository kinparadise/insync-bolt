import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedLinearGradient } from '@/components/ThemedLinearGradient';
import { useTheme } from '@/contexts/ThemeContext';
import { GraduationCap, Briefcase, Sparkles } from 'lucide-react-native';

export default function ToolsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    <ThemedLinearGradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/screens/classroom')}>
            <GraduationCap color={theme.colors.primary} size={36} />
            <Text style={styles.toolLabel}>Classroom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/screens/business')}>
            <Briefcase color={theme.colors.primary} size={36} />
            <Text style={styles.toolLabel}>Business</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.coolStuffSection}>
          <Sparkles color={theme.colors.accent} size={32} />
          <Text style={styles.coolStuffText}>More cool tools coming soon!</Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 32,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 48,
  },
  toolCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: 140,
    height: 140,
    elevation: 2,
  },
  toolLabel: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  coolStuffSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  coolStuffText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
}); 