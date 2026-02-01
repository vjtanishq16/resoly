import { ScrollView, StyleSheet, View, Switch } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState({
    enabled: true,
    goalReminders: true,
    dailySummary: true,
    achievements: true,
    quietHours: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    disabled 
  }: { 
    title: string; 
    description: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.secondary }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
        <SettingItem
          title="Enable Notifications"
          description="Receive all app notifications"
          value={settings.enabled}
          onValueChange={(value) => updateSetting('enabled', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Types</Text>
        <SettingItem
          title="Goal Reminders"
          description="Remind me about my active goals"
          value={settings.goalReminders}
          onValueChange={(value) => updateSetting('goalReminders', value)}
          disabled={!settings.enabled}
        />
        <SettingItem
          title="Daily Summary"
          description="Daily progress report"
          value={settings.dailySummary}
          onValueChange={(value) => updateSetting('dailySummary', value)}
          disabled={!settings.enabled}
        />
        <SettingItem
          title="Achievements"
          description="When you hit milestones"
          value={settings.achievements}
          onValueChange={(value) => updateSetting('achievements', value)}
          disabled={!settings.enabled}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Do Not Disturb</Text>
        <SettingItem
          title="Quiet Hours"
          description="Mute notifications during specific times"
          value={settings.quietHours}
          onValueChange={(value) => updateSetting('quietHours', value)}
          disabled={!settings.enabled}
        />
        {settings.quietHours && (
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            📝 Time selection coming soon
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});