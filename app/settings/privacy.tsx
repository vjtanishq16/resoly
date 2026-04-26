import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/app/contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: April 26, 2026</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Resoly collects information that you provide directly to us when you create an account, such as your name, email address, and goal-related data. We also collect usage data to improve our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Information</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            We use the information we collect to provide, maintain, and improve Resoly, to communicate with you, and to personalize your experience. Your data helps us track your progress and provide reminders.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Security</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Third-Party Services</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Resoly may use third-party services for analytics and push notifications. These services may collect information sent by your device as part of a web page request.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Your Choices</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            You can access, update, or delete your account information at any time through the app settings. If you delete your account, we will remove your personal data from our active databases.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Contact Us</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            If you have any questions about this Privacy Policy, please contact us at support@resoly.app or via the GitHub repository.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 Resoly App. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
  },
});
