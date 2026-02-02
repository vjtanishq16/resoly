import { Text, View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform, StatusBar } from "react-native";
import { ActivityIndicator, FAB } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { getActiveResolutions, getTodayLogs, calculateStreak } from "@/lib/database";
import type { Resolution, DailyLog } from "@/lib/database";
import ResolutionCard from "./components/ResolutionCard";
import LogTimeModal from "./log-time";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Index() {
  const { signOut, user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logTimeModal, setLogTimeModal] = useState<{
    visible: boolean;
    resolution: any;
  } | null>(null);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const [fetchedResolutions, fetchedLogs] = await Promise.all([
        getActiveResolutions(user.$id),
        getTodayLogs(user.$id),
      ]);
      
      setResolutions(fetchedResolutions);
      setTodayLogs(fetchedLogs);

      // Calculate streaks for all resolutions
      const streakPromises = fetchedResolutions.map(async (r) => {
        const streak = await calculateStreak(user.$id, r.$id);
        return { id: r.$id, streak };
      });

      const streakResults = await Promise.all(streakPromises);
      const streaksMap: Record<string, number> = {};
      streakResults.forEach(({ id, streak }) => {
        streaksMap[id] = streak;
      });
      setStreaks(streaksMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getLoggedMinutes = (resolutionId: string) => {
    const log = todayLogs.find(log => log.resolutionId === resolutionId);
    return log?.actualMinutes || 0;
  };

  const getStreak = (resolutionId: string) => {
    return streaks[resolutionId] || 0;
  };

  const totalActual = resolutions.reduce(
    (sum, r) => sum + getLoggedMinutes(r.$id), 
    0
  );
  const totalPlanned = resolutions.reduce(
    (sum, r) => sum + r.plannedMinutesPerDay, 
    0
  );
  const totalProgress = totalPlanned > 0 
    ? Math.round((totalActual / totalPlanned) * 100) 
    : 0;

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  const handleSignOut = async () => {
    setIsSigningOut(true);
    if (signOut) {
      await signOut();
    }
    setIsSigningOut(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7A9B76" />
        <Text style={styles.loadingText}>Loading your resolutions...</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#7A9B76"
            colors={["#7A9B76"]}
          />
        }
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.decorativeBlob1} />
          <View style={styles.decorativeBlob2} />
          
          <View style={styles.heroContent}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.date}>{dateString}</Text>
                <Text style={styles.headerTitle}>Today's Goals</Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/profile')}
                style={styles.profileButton}
              >
                <MaterialCommunityIcons name="account-circle-outline" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Total Progress */}
            {resolutions.length > 0 && (
              <View style={styles.progressBox}>
                <Text style={styles.progressLabel}>TOTAL PROGRESS</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressTime}>
                    {totalActual}m <Text style={styles.progressTimeSub}>/ {totalPlanned}m</Text>
                  </Text>
                  <Text style={styles.progressPercent}>{totalProgress}%</Text>
                </View>
                
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFilled,
                      { width: `${Math.min(totalProgress, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Active Resolutions */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Active Resolutions</Text>
          
          {resolutions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>No resolutions yet</Text>
              <Text style={styles.emptyText}>
                Start your journey by creating your first resolution
              </Text>
            </View>
          ) : (
            resolutions.map((resolution, index) => (
              <ResolutionCard
                key={resolution.$id}
                resolution={{
                  title: resolution.title,
                  category: resolution.category,
                  color: resolution.color,
                  actualMinutes: getLoggedMinutes(resolution.$id),
                  plannedMinutes: resolution.plannedMinutesPerDay,
                  streak: getStreak(resolution.$id),
                }}
                isFirst={index === 0}
                onPress={() => router.push(`/resolution-details?id=${resolution.$id}`)}
                onLogTime={() => {
                  setLogTimeModal({
                    visible: true,
                    resolution: {
                      id: resolution.$id,
                      title: resolution.title,
                      color: resolution.color,
                      plannedMinutes: resolution.plannedMinutesPerDay,
                      actualMinutes: getLoggedMinutes(resolution.$id),
                    },
                  });
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push('/add-resolution')}
      />

      {/* Log Time Modal */}
      {logTimeModal && user && (
        <LogTimeModal
          visible={logTimeModal.visible}
          onClose={() => setLogTimeModal(null)}
          resolution={logTimeModal.resolution}
          userId={user.$id}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Using Figma design system colors
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE", // --color-bg-secondary
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
    paddingBottom: 100,
  },
  
  heroCard: {
    backgroundColor: "#7A9B76", // --color-moss
    borderBottomLeftRadius: 32, // --radius-xl
    borderBottomRightRadius: 32,
    marginBottom: 24, // --space-3
    position: "relative",
    overflow: "hidden",
  },
  
  decorativeBlob1: {
    position: "absolute",
    top: -80,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(122, 155, 118, 0.15)",
  },
  decorativeBlob2: {
    position: "absolute",
    bottom: -40,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(122, 155, 118, 0.12)",
  },
  
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingBottom: 28,
    position: "relative",
    zIndex: 1,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  
  profileButton: {
    padding: 4,
  },
  
  date: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 4,
    fontWeight: "400",
  },
  
  headerTitle: {
    fontSize: 34,
    fontWeight: "400",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  
  progressBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20, // --radius-lg
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  
  progressLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 1.2,
    marginBottom: 12,
    fontWeight: "600",
  },
  
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  
  progressTime: {
    fontSize: 20,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  
  progressTimeSub: {
    fontSize: 16,
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  progressPercent: {
    fontSize: 40,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8, // --radius-sm
    overflow: "hidden",
  },
  
  progressBarFilled: {
    height: "100%",
    backgroundColor: "#C89968", // --color-sand
    borderRadius: 8,
  },
  
  contentSection: {
    paddingHorizontal: 20,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: "400",
    color: "#2A2A2A", // --color-text-primary
    marginBottom: 16, // --space-2
    letterSpacing: -0.3,
  },
  
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 8, // --space-1
  },
  
  emptyText: {
    fontSize: 15,
    color: "#6A6A6A", // --color-text-secondary
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    borderRadius: 28,
    backgroundColor: "#7A9B76",
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
    marginTop: 16, // --space-2
    fontSize: 16,
    color: "#6A6A6A",
    fontWeight: "500",
  },
});