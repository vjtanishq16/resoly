import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { ActivityIndicator } from "react-native-paper";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function VerifySuccessScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { colors } = useTheme();
  const [status, setStatus] = useState<'verifying' | 'success'>('verifying');

  useEffect(() => {
    handleVerification();
  }, []);

  const handleVerification = async () => {
    try {
      // Wait a moment for Appwrite to process the verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh user data to get updated verification status
      await refreshUser();
      
      setStatus('success');
      
      // Redirect to home - the route guard will handle navigation
      setTimeout(() => {
        router.replace("/");
      }, 1000);
      
    } catch (error) {
      console.error("Verification error:", error);
      // Still redirect, the app will show verification status
      setTimeout(() => {
        router.replace("/");
      }, 1000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Verifying your email...
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Please wait a moment
            </Text>
          </>
        )}
        
        {status === 'success' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Email Verified!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Taking you to the app...
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successIcon: {
    fontSize: 48,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});