import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getUserStats } from "@/lib/database";
import StatCard from "./components/StatCard";
import AchievementCard from "./components/AchievementCard";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [stats, setStats] = useState({
    totalResolutions: 0,
    activeResolutions: 0,
    totalMinutesLogged: 0,
    totalDaysLogged: 0,
    longestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const userStats = await getUserStats(user.$id);
      setStats(userStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    if (signOut) {
      await signOut();
    }
    setIsSigningOut(false);
  };

  // Enhanced achievements with real data
  const achievements = [
    {
      id: 1,
      title: "First Step",
      description: "Created your first resolution",
      icon: "star-outline",
      unlocked: stats.totalResolutions > 0,
      color: "#FFD700",
    },
    {
      id: 2,
      title: "Getting Started",
      description: "Log time for 3 days",
      icon: "calendar-check",
      unlocked: stats.totalDaysLogged >= 3,
      color: colors.primary,
    },
    {
      id: 3,
      title: "Committed",
      description: "Build a 7-day streak",
      icon: "fire",
      unlocked: stats.longestStreak >= 7,
      color: "#FF6B35",
    },
    {
      id: 4,
      title: "Dedicated",
      description: "Build a 30-day streak",
      icon: "trophy",
      unlocked: stats.longestStreak >= 30,
      color: "#C89968",
    },
    {
      id: 5,
      title: "Century Club",
      description: "Log 100 total hours",
      icon: "clock-check",
      unlocked: stats.totalMinutesLogged >= 6000,
      color: "#6B8E9E",
    },
    {
      id: 6,
      title: "Overachiever",
      description: "Maintain 5 active resolutions",
      icon: "flash",
      unlocked: stats.activeResolutions >= 5,
      color: "#B8A8C8",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isSigningOut && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Signing you out...
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <View style={styles.backButton} />
        </View>

        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={80}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name || "User"}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard 
            value={stats.activeResolutions} 
            label={"Active\nResolutions"} 
          />
          <StatCard 
            value={stats.longestStreak} 
            label={"Longest\nStreak"} 
          />
          <StatCard 
            value={Math.round(stats.totalMinutesLogged / 60)} 
            label={"Total\nHours"} 
          />
          <StatCard 
            value={stats.totalDaysLogged} 
            label={"Days\nLogged"} 
          />
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Achievements
            </Text>
            <Text style={[styles.achievementCount, { color: colors.primary }]}>
              {unlockedCount}/{achievements.length}
            </Text>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                color={achievement.color}
                unlocked={achievement.unlocked}
              />
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/settings/notifications')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingText, { color: colors.text }]}>
                Notifications
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/settings/appearance')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="palette-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingText, { color: colors.text }]}>
                Appearance
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/settings/help')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingText, { color: colors.text }]}>
                Help & Support
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/settings/about')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingText, { color: colors.text }]}>
                About
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <Button
          mode="outlined"
          icon="logout"
          textColor="#D32F2F"
          style={styles.signOutButton}
          labelStyle={styles.signOutButtonLabel}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          Sign Out
        </Button>

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  userCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  signOutButton: {
    borderRadius: 12,
    borderColor: "#D32F2F",
    marginBottom: 16,
  },
  signOutButtonLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  version: {
    fontSize: 12,
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245, 243, 238, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
});