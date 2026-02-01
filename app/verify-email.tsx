import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/app/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function VerifyEmailScreen() {
  const { user, signOut, resendVerificationEmail, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError('');
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setError('');
    try {
      await refreshUser();
      // The RouteGuard will automatically redirect if verified
    } catch (err: any) {
      setError('Failed to check verification status');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <MaterialCommunityIcons 
            name="email-check-outline" 
            size={80} 
            color={colors.primary} 
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Verify Your Email
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          We've sent a verification link to:
        </Text>

        <Text style={[styles.email, { color: colors.primary }]}>
          {user?.email}
        </Text>

        <View style={[styles.stepBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            📧 Steps to verify:
          </Text>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            1. Check your email inbox{'\n'}
            2. Click the verification link{'\n'}
            3. You'll see a success message in your browser{'\n'}
            4. Come back here and tap "I've Verified My Email"
          </Text>
        </View>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={handleCheckVerification}
            loading={isChecking}
            disabled={isChecking}
            style={[styles.button, { backgroundColor: colors.primary }]}
            labelStyle={styles.buttonLabel}
          >
            I've Verified My Email
          </Button>

          <Button
            mode="outlined"
            onPress={handleResend}
            loading={isResending}
            disabled={isResending}
            style={[styles.button, { borderColor: colors.primary }]}
            labelStyle={[styles.buttonLabel, { color: colors.primary }]}
          >
            Resend Verification Email
          </Button>

          {resendSuccess && (
            <View style={[styles.successBox, { backgroundColor: '#4CAF50' + '20' }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={[styles.successText, { color: '#4CAF50' }]}>
                Verification email sent! Check your inbox.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Wrong email address?
          </Text>
          <TouchableOpacity onPress={signOut}>
            <Text style={[styles.signOutText, { color: colors.primary }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={20} 
            color={colors.textSecondary} 
          />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            💡 Don't see the email? Check your spam/junk folder. The email is sent from Appwrite.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});