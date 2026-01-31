import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { useState } from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    if (signOut) {
      await signOut();
    }
    setIsSigningOut(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.heroTitle}>Your Journey</Text>
          <Text style={styles.heroSubtitle}>Building better habits, one day at a time</Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="trophy-outline" size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="fire" size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Avg. Hours/Day</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#7A9B76" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Manage reminders</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ACACAC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="palette-outline" size={20} color="#7A9B76" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Appearance</Text>
              <Text style={styles.settingDescription}>Customize your experience</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ACACAC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color="#7A9B76" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Help & Support</Text>
              <Text style={styles.settingDescription}>FAQs and contact</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ACACAC" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleSignOut}
          loading={isSigningOut}
          disabled={isSigningOut}
          textColor="#D32F2F"
          style={styles.signOutButton}
        >
          Sign Out
        </Button>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>resoly v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with care for better habits</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  header: {
    backgroundColor: "#7A9B76",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: "#7A9B76",
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F0F5EF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#6A6A6A",
  },
  signOutButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderColor: "#D32F2F",
    marginTop: 12,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: "#ACACAC",
  },
  footerSubtext: {
    fontSize: 10,
    color: "#ACACAC",
    marginTop: 4,
  },
});
