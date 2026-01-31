import { Text, View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform, StatusBar } from "react-native";
import { ActivityIndicator, FAB } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { getActiveResolutions, getTodayLogs } from "@/lib/database";
import type { Resolution, DailyLog } from "@/lib/database";

import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ResolutionCard from "./components/ResolutionCard";

export default function Index() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const [fetchedResolutions, fetchedLogs] = await Promise.all([
        getActiveResolutions(user.$id),
        getTodayLogs(user.$id),
      ]);
      
      setResolutions(fetchedResolutions);
      setTodayLogs(fetchedLogs);
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
    return 0;
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
        {/* Hero Card - Full Width */}
        <View style={styles.heroCard}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          
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
                <MaterialCommunityIcons name="account-circle-outline" size={32} color="#FFFFFF" />
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
                      { width: `${totalProgress}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Active Resolutions - With padding */}
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
    isFirst={index === 0}  // Changed from isLarge to isFirst
    onPress={() => console.log("View details:", resolution.title)}
    onLogTime={() => console.log("Log time:", resolution.title)}
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
    paddingBottom: 100,
  },
  
  // Hero card - NO horizontal padding/margin
  heroCard: {
    backgroundColor: "#7A9B76",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  decorativeCircle3: {
    position: "absolute",
    top: "40%",
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    paddingBottom: 32,
    position: "relative",
    zIndex: 1,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  
  profileButton: {
    padding: 4,
  },
  
  date: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 6,
    fontWeight: "400",
  },
  
  headerTitle: {
    fontSize: 36,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  
  progressBox: {
    backgroundColor: "rgba(122, 155, 118, 0.35)",
    borderRadius: 20,
    padding: 20,
  },
  
  progressLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 1.5,
    marginBottom: 10,
    fontWeight: "600",
  },
  
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  
  progressTime: {
    fontSize: 22,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  
  progressTimeSub: {
    fontSize: 18,
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.75)",
  },
  
  progressPercent: {
    fontSize: 44,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(200, 137, 104, 0.3)",
    borderRadius: 10,
    overflow: "hidden",
  },
  
  progressBarFilled: {
    height: "100%",
    backgroundColor: "#C89968",
    borderRadius: 10,
  },
  
  // Content section WITH padding
  contentSection: {
    paddingHorizontal: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  
  emptyText: {
    fontSize: 14,
    color: "#6A6A6A",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  
  // Floating Action Button
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#7A9B76",
    borderRadius: 28,
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