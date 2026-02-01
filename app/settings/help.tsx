import { ScrollView, StyleSheet, View, Linking, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '@/app/contexts/ThemeContext';
import Octicons from '@expo/vector-icons/Octicons';
import { replace } from 'expo-router/build/global-state/routing';
import { router } from 'expo-router';

export default function HelpScreen() {
  const { colors } = useTheme();

  const openEmail = (type: 'support' | 'bug' | 'feature') => {
    const email = 'support@goaltracker.com';
    let subject = '';
    let body = '';

    switch (type) {
      case 'bug':
        subject = 'Bug Report';
        body = 'Please describe the bug you encountered:\n\n';
        break;
      case 'feature':
        subject = 'Feature Request';
        body = 'Please describe the feature you would like:\n\n';
        break;
      default:
        subject = 'Support Request';
        body = 'How can we help you?\n\n';
    }

    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  const HelpItem = ({ 
    icon, 
    title, 
    description, 
    onPress 
  }: { 
    icon: keyof typeof Octicons.glyphMap; 
    title: string; 
    description: string; 
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.helpItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Octicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.helpText}>
        <Text style={[styles.helpTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.helpDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Octicons name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Get Help</Text>
        
        <HelpItem
          icon="question"
          title="FAQ"
          description="Frequently asked questions"
          onPress={() => openURL('https://goaltracker.com/faq')}
        />
        
        <HelpItem
          icon="book"
          title="User Guide"
          description="Learn how to use all features"
          onPress={() => openURL('https://goaltracker.com/guide')}
        />
        
        <HelpItem
          icon="video"
          title="Video Tutorials"
          description="Watch step-by-step guides"
          onPress={() => openURL('https://youtube.com/@goaltracker')}
        />
        
        <HelpItem
          icon="rocket"
          title="Getting Started"
          description="New to the app? Start here"
          onPress={() => router.replace('/')}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Support</Text>
        
        <HelpItem
          icon="mail"
          title="Email Support"
          description="support@goaltracker.com"
          onPress={() => openEmail('support')}
        />
        
        <HelpItem
          icon="bug"
          title="Report a Bug"
          description="Help us fix issues"
          onPress={() => openEmail('bug')}
        />
        
        <HelpItem
          icon="light-bulb"
          title="Request a Feature"
          description="Suggest new features"
          onPress={() => openEmail('feature')}
        />
        
        <HelpItem
          icon="comment-discussion"
          title="Live Chat"
          description="Chat with support team"
          onPress={() => {/* Implement chat or show "Coming soon" */}}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Community</Text>
        
        <HelpItem
          icon="people"
          title="Join Discord"
          description="Chat with other users"
          onPress={() => openURL('https://discord.gg/goaltracker')}
        />
        
        <HelpItem
          icon="mark-github"
          title="GitHub"
          description="View source code & contribute"
          onPress={() => openURL('https://github.com/yourusername/goaltracker')}
        />
        
        <HelpItem
          icon="file-code"
          title="Documentation"
          description="Technical documentation"
          onPress={() => openURL('https://docs.goaltracker.com')}
        />
        
        <HelpItem
          icon="megaphone"
          title="Feature Roadmap"
          description="See what's coming next"
          onPress={() => openURL('https://goaltracker.com/roadmap')}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Resources</Text>
        
        <HelpItem
          icon="download"
          title="Download Data"
          description="Export your goals and progress"
          onPress={() => {/* Implement export functionality */}}
        />
        
        <HelpItem
          icon="tools"
          title="Troubleshooting"
          description="Fix common issues"
          onPress={() => openURL('https://goaltracker.com/troubleshooting')}
        />
      </View>

      <View style={[styles.tipBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
        <Octicons name="info" size={20} color={colors.primary} style={styles.tipIcon} />
        <Text style={[styles.tipText, { color: colors.text }]}>
          💡 <Text style={{ fontWeight: '600' }}>Tip:</Text> Most questions can be answered in our FAQ section. 
          Check there first for the fastest response!
        </Text>
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
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: 14,
  },
  tipBox: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});