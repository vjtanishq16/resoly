import { Text, View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { getActiveResolutions, getTodayLogs } from "@/lib/database";
import type { Resolution, DailyLog } from "@/lib/database";
import ResolutionCard from "../components/ResolutionCard";


export default function Index() {
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch resolutions and today's logs
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

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Get today's logged minutes for a resolution
  const getLoggedMinutes = (resolutionId: string) => {
    const log = todayLogs.find(log => log.resolutionId === resolutionId);
    return log?.actualMinutes || 0;
  };

  // Calculate streak (simplified - just return 0 for now, we'll calculate later)
  const getStreak = (resolutionId: string) => {
    return 0; // TODO: Calculate real streak
  };

  // Calculate total progress
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

  // Format date
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
      {/* Loading Overlay for Sign Out */}
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{dateString}</Text>
            <Text style={styles.headerTitle}>Today's Goals</Text>
          </View>
          <Button 
            mode="text" 
            icon="logout" 
            onPress={handleSignOut}
            textColor="#6A6A6A"
          >
            Sign Out
          </Button>
        </View>

        {/* Total Progress Card */}
        {resolutions.length > 0 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>TOTAL PROGRESS</Text>
            <Text style={styles.progressTime}>
              {totalActual}m / {totalPlanned}m
            </Text>
            <Text style={styles.progressPercent}>{totalProgress}%</Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${totalProgress}%` }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Active Resolutions */}
        <View style={styles.section}>
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
            resolutions.map((resolution) => (
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
                onPress={() => console.log("View details:", resolution.title)}
                onLogTime={() => console.log("Log time:", resolution.title)}
              />
            ))
          )}
        </View>

        {/* Add Resolution Button */}
        <Button
          mode="contained"
          icon="plus"
          buttonColor="#7A9B76"
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
          onPress={() => console.log("Add resolution")}
        >
          Add Resolution
        </Button>
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: "#6A6A6A",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#2A2A2A",
  },
  progressCard: {
    backgroundColor: "#7A9B76",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    letterSpacing: 1,
    marginBottom: 8,
  },
  progressTime: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 16,
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
  },
  addButton: {
    borderRadius: 16,
    marginBottom: 40,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: "500",
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