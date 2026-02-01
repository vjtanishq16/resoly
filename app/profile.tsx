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
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getActiveResolutions, getTodayLogs } from "@/lib/database";
import type { Resolution, DailyLog } from "@/lib/database";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [fetchedResolutions, fetchedLogs] = await Promise.all([
        getActiveResolutions(user.$id),
        getTodayLogs(user.$id),
      ]);

      setResolutions(fetchedResolutions);
      setTodayLogs(fetchedLogs);
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

  // Calculate stats
  const totalResolutions = resolutions.length;
  const completedToday = todayLogs.filter((log) => {
    const resolution = resolutions.find((r) => r.$id === log.resolutionId);
    return resolution && log.actualMinutes >= resolution.plannedMinutesPerDay;
  }).length;

  const totalMinutesToday = todayLogs.reduce(
    (sum, log) => sum + log.actualMinutes,
    0
  );

  const totalPlannedToday = resolutions.reduce(
    (sum, r) => sum + r.plannedMinutesPerDay,
    0
  );

  // Achievements (simplified for now)
  const achievements = [
    {
      id: 1,
      title: "First Step",
      description: "Created your first resolution",
      icon: "star-outline",
      unlocked: totalResolutions > 0,
      color: "#FFD700",
    },
    {
      id: 2,
      title: "Committed",
      description: "Log time for 3 days in a row",
      icon: "fire",
      unlocked: false, // TODO: Calculate real streak
      color: "#FF6B35",
    },
    {
      id: 3,
      title: "Overachiever",
      description: "Complete all resolutions in a day",
      icon: "trophy",
      unlocked: totalResolutions > 0 && completedToday === totalResolutions,
      color: "#7A9B76",
    },
    {
      id: 4,
      title: "Time Master",
      description: "Log 300 minutes in a single day",
      icon: "clock-check",
      unlocked: totalMinutesToday >= 300,
      color: "#6B8E9E",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7A9B76" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#2A2A2A"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.backButton} />
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={80}
              color="#7A9B76"
            />
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalResolutions}</Text>
            <Text style={styles.statLabel}>Active{"\n"}Resolutions</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedToday}</Text>
            <Text style={styles.statLabel}>Completed{"\n"}Today</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutesToday}</Text>
            <Text style={styles.statLabel}>Minutes{"\n"}Today</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {totalPlannedToday > 0
                ? Math.round((totalMinutesToday / totalPlannedToday) * 100)
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>Today's{"\n"}Progress</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>
              {unlockedCount}/{achievements.length}
            </Text>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    {
                      backgroundColor: achievement.unlocked
                        ? `${achievement.color}20`
                        : "#F5F3EE",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={achievement.icon as any}
                    size={28}
                    color={
                      achievement.unlocked ? achievement.color : "#ACACAC"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.unlocked && styles.achievementTitleLocked,
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color="#6A6A6A"
              />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#ACACAC"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="palette-outline"
                size={24}
                color="#6A6A6A"
              />
              <Text style={styles.settingText}>Appearance</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#ACACAC"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color="#6A6A6A"
              />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#ACACAC"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color="#6A6A6A"
              />
              <Text style={styles.settingText}>About</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#ACACAC"
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

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3EE",
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
    color: "#2A2A2A",
  },
  userCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#2A2A2A",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6A6A6A",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#7A9B76",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6A6A6A",
    textAlign: "center",
    lineHeight: 16,
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
    color: "#2A2A2A",
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7A9B76",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 4,
    textAlign: "center",
  },
  achievementTitleLocked: {
    color: "#ACACAC",
  },
  achievementDescription: {
    fontSize: 11,
    color: "#6A6A6A",
    textAlign: "center",
    lineHeight: 14,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#2A2A2A",
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
    color: "#ACACAC",
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
    color: "#6A6A6A",
    fontWeight: "500",
  },
});