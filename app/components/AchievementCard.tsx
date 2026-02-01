import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/contexts/ThemeContext';

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export default function AchievementCard({ 
  title, 
  description, 
  icon, 
  color, 
  unlocked 
}: AchievementCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: unlocked ? color : colors.border,
          opacity: unlocked ? 1 : 0.5,
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: unlocked ? color + '20' : colors.border }]}>
        <MaterialCommunityIcons 
          name={icon as any} 
          size={28} 
          color={unlocked ? color : colors.textSecondary} 
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {description}
      </Text>
      {unlocked && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <MaterialCommunityIcons name="check" size={12} color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});