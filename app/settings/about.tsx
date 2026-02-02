import { ScrollView, StyleSheet, View, Linking, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '@/app/contexts/ThemeContext';
import Octicons from '@expo/vector-icons/Octicons';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const { colors } = useTheme();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.extra?.buildNumber || '1';

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  const rateApp = () => {
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/id123456789', // Replace with your app ID
      android: 'https://play.google.com/store/apps/details?id=com.yourapp.goaltracker',
    });
    if (url) openURL(url);
  };

  const shareApp = async () => {
    // Implement share functionality
    const message = 'Check out Goal Tracker - the best app for tracking your goals!';
    // You can use expo-sharing or react-native Share API
  };

  const InfoItem = ({ 
    icon, 
    title, 
    value, 
    onPress 
  }: { 
    icon: keyof typeof Octicons.glyphMap; 
    title: string; 
    value: string; 
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.infoItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoLeft}>
        <Octicons name={icon} size={20} color={colors.primary} style={styles.infoIcon} />
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.infoRight}>
        <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value}</Text>
        {onPress && <Octicons name="chevron-right" size={16} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoText}>🌱</Text>
        </View>
        
        <Text style={[styles.appName, { color: colors.text }]}>Goal Tracker</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Track your resolutions and achieve your goals!
        </Text>
        
        <View style={styles.versionBadge}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version {appVersion} ({buildNumber})
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={rateApp}
          >
            <Octicons name="star" size={20} color="white" />
            <Text style={styles.actionButtonText}>Rate App</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={shareApp}
          >
            <Octicons name="share" size={20} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Information</Text>
        
        <InfoItem
          icon="info"
          title="App Version"
          value={appVersion}
        />
        
        <InfoItem
          icon="package"
          title="Build Number"
          value={buildNumber}
        />
        
        <InfoItem
          icon="device-mobile"
          title="Platform"
          value={Platform.OS === 'ios' ? 'iOS' : 'Android'}
        />
      </View>

      {/* Legal
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
        
        <InfoItem
          icon="law"
          title="Privacy Policy"
          value=""
          onPress={() => openURL('https://goaltracker.com/privacy')}
        />
        
        <InfoItem
          icon="file-text"
          title="Terms of Service"
          value=""
          onPress={() => openURL('https://goaltracker.com/terms')}
        />
        
        <InfoItem
          icon="shield"
          title="Data & Security"
          value=""
          onPress={() => openURL('https://goaltracker.com/security')}
        />
        
        <InfoItem
          icon="code"
          title="Open Source Licenses"
          value=""
          onPress={() => openURL('https://goaltracker.com/licenses')}
        />
      </View> */}

      {/* Connect */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connect With Me</Text>
{/*         
        <InfoItem
          icon="globe"
          title="Website"
          value="goaltracker.com"
          onPress={() => openURL('https://goaltracker.com')}
        /> */}
        
        <InfoItem
          icon="mark-github"
          title="GitHub"
          value="vjtanishq16"
          onPress={() => openURL('https://github.com/vjtanishq16/')}
        />
        
        <InfoItem
          icon="mail"
          title="Email"
          value="vijaytanishq16@gmail.com"
          onPress={() => Linking.openURL('mailto:vijaytanishq16@gmail.com')}
        />
        
        <InfoItem
          icon="broadcast"
          title="Twitter"
          value="@vj_tanishq16"
          onPress={() => openURL('https://x.com/vj_tanishq16')}
        />
      </View>

      {/* Credits */}
      <View style={styles.section}>
        {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>Credits</Text> */}
        
        <View style={[styles.creditsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
            Developed with ❤️ by Tanishq .
          </Text>
          <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
            Built with React Native & Expo
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.copyright, { color: colors.textSecondary }]}>
          © 2026 Goal Tracker. All rights reserved.
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Made with passion for productivity
        </Text>
      </View>

      {/* Easter Egg - Tap Counter */}
      <View style={styles.easterEgg}>
        <TouchableOpacity
          onPress={() => {
            // Add a fun easter egg - maybe show developer info or a hidden feature
            console.log('🎉 Easter egg tapped!');
          }}
        >
          <Text style={[styles.easterEggText, { color: colors.border }]}>
            v{appVersion}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoValue: {
    fontSize: 14,
  },
  creditsBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  creditsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  copyright: {
    fontSize: 12,
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  easterEgg: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  easterEggText: {
    fontSize: 10,
    opacity: 0.3,
  },
});