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

  const totalHours = Math.round(stats.totalMinutesLogged / 60);
  const avgHoursPerDay = stats.totalDaysLogged > 0 
    ? (stats.totalMinutesLogged / 60 / stats.totalDaysLogged).toFixed(1)
    : "0.0";

  // Enhanced achievements with real data and progress
  const achievements = [
    {
      id: 1,
      title: "First Step",
      description: "Created your first resolution",
      icon: "star",
      emoji: "⭐",
      unlocked: stats.totalResolutions > 0,
      color: "#FFE5B4",
      progress: stats.totalResolutions > 0 ? 100 : 0,
      current: stats.totalResolutions,
      target: 1,
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Completed all goals for 7 days",
      icon: "fire",
      emoji: "🔥",
      unlocked: stats.longestStreak >= 7,
      color: "#FFE5D9",
      progress: Math.min((stats.longestStreak / 7) * 100, 100),
      current: stats.longestStreak,
      target: 7,
    },
    {
      id: 3,
      title: "Early Bird",
      description: "Logged 100 hours total",
      icon: "alarm",
      emoji: "⏰",
      unlocked: stats.totalMinutesLogged >= 6000,
      color: "#E8F5E9",
      progress: Math.min((stats.totalMinutesLogged / 6000) * 100, 100),
      current: Math.round(stats.totalMinutesLogged / 60),
      target: 100,
    },
    {
      id: 4,
      title: "Century Club",
      description: "Reach a 100-day streak",
      icon: "trophy",
      emoji: "🏆",
      unlocked: stats.longestStreak >= 100,
      color: "#F3E5F5",
      progress: Math.min((stats.longestStreak / 100) * 100, 100),
      current: stats.longestStreak,
      target: 100,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#7A9B76" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isSigningOut && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7A9B76" />
          <Text style={styles.loadingText}>Signing you out...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header with Gradient */}
        <View style={styles.heroHeader}>
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          
          <View style={styles.heroContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 36 }}>{user?.name ? user.name.charAt(0).toUpperCase() : ""}</Text>
            </View>

            <Text style={styles.heroTitle}>Your Journey</Text>
            <Text style={styles.heroSubtitle}>
              Building better habits, one day at a time
            </Text>

            {/* Stats Grid in Hero */}
            <View style={styles.heroStatsGrid}>
              <View style={styles.heroStatCard}>
                <MaterialCommunityIcons name="trophy-outline" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroStatValue}>{totalHours}</Text>
                <Text style={styles.heroStatLabel}>Total Hours</Text>
              </View>

              <View style={styles.heroStatCard}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroStatValue}>{stats.totalDaysLogged}</Text>
                <Text style={styles.heroStatLabel}>Days Active</Text>
              </View>
            </View>

            <View style={[styles.heroStatCardWide]}>
              <View style={styles.heroStatHalf}>
                <MaterialCommunityIcons name="chart-line-variant" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroStatValue}>{stats.longestStreak}</Text>
                <Text style={styles.heroStatLabel}>Longest Streak</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatHalf}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroStatValue}>{avgHoursPerDay}</Text>
                <Text style={styles.heroStatLabel}>Avg. Hours/Day</Text>
              </View>
            </View>
          </View>
        </View>

        {/* White Content Section */}
        <View style={styles.contentSection}>
          {/* Achievements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>

            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    { backgroundColor: achievement.unlocked ? achievement.color : "#F5F5F5" }
                  ]}
                >
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  <Text style={[
                    styles.achievementTitle,
                    { color: achievement.unlocked ? "#2A2A2A" : "#AFAFAF" }
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    { color: achievement.unlocked ? "#6A6A6A" : "#CFCFCF" }
                  ]}>
                    {achievement.description}
                  </Text>
                  {!achievement.unlocked && (
                    <>
                      <View style={styles.achievementProgress}>
                        <View style={[
                          styles.achievementProgressBar,
                          { width: `${achievement.progress}%` }
                        ]} />
                      </View>
                      <Text style={styles.achievementProgressText}>
                        {achievement.id === 3 
                          ? `${achievement.current}/${achievement.target} hours`
                          : `${achievement.current}/${achievement.target} days`
                        }
                      </Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.settingsList}>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/settings/notifications')}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconCircle, { backgroundColor: "#E8F5E9" }]}>
                    <MaterialCommunityIcons name="bell-outline" size={20} color="#7A9B76" />
                  </View>
                  <View>
                    <Text style={styles.settingText}>Notifications</Text>
                    <Text style={styles.settingSubtext}>Manage reminders</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CFCFCF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/settings/appearance')}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconCircle, { backgroundColor: "#F3E5F5" }]}>
                    <MaterialCommunityIcons name="palette-outline" size={20} color="#9B7E8B" />
                  </View>
                  <View>
                    <Text style={styles.settingText}>Appearance</Text>
                    <Text style={styles.settingSubtext}>Customize your experience</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CFCFCF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/settings/edit-profile')}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconCircle, { backgroundColor: "#FFF4E6" }]}>
                    <MaterialCommunityIcons name="account-edit-outline" size={20} color="#C89968" />
                  </View>
                  <View>
                    <Text style={styles.settingText}>Edit Profile</Text>
                    <Text style={styles.settingSubtext}>Update your name and info</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CFCFCF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/settings/about')}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconCircle, { backgroundColor: "#E3F2FD" }]}>
                    <MaterialCommunityIcons name="help-circle-outline" size={20} color="#6B8E9E" />
                  </View>
                  <View>
                    <Text style={styles.settingText}>About</Text>
                    <Text style={styles.settingSubtext}>Know more about resoly</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CFCFCF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#D32F2F" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>resoly v1.0.0</Text>
          <Text style={styles.tagline}>Made with care for better habits</Text>
        </View>
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
    paddingBottom: 40,
  },
  
  // Hero Header
  heroHeader: {
    backgroundColor: "#7A9B76",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    position: "relative",
    overflow: "hidden",
  },
  heroBlob1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroBlob2: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 24,
  },
  heroStatsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "flex-start",
  },
  heroStatCardWide: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  heroStatHalf: {
    flex: 1,
    alignItems: "flex-start",
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },
  heroStatValue: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  
  // Content Section
  contentSection: {
    backgroundColor: "#F5F3EE",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  
  // Achievements
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    borderRadius: 16,
    padding: 20,
    position: "relative",
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  achievementProgress: {
    height: 4,
    backgroundColor: "rgba(175, 175, 175, 0.3)",
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  achievementProgressBar: {
    height: "100%",
    backgroundColor: "#AFAFAF",
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 11,
    color: "#AFAFAF",
    marginTop: 4,
    fontWeight: "500",
  },
  
  // Settings
  settingsList: {
    gap: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2A2A2A",
  },
  settingSubtext: {
    fontSize: 12,
    color: "#8A8A8A",
    marginTop: 2,
  },
  
  // Sign Out
  signOutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#D32F2F",
  },
  
  // Footer
  version: {
    fontSize: 12,
    textAlign: "center",
    color: "#AFAFAF",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    textAlign: "center",
    color: "#CFCFCF",
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
    color: "#6A6A6A",
  },
});