import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import {
  getAllResolutionLogs,
  calculateStreak,
  deleteResolution,
  updateResolution,
} from "@/lib/database";
import type { Resolution, DailyLog } from "@/lib/database";
import { LineChart } from "react-native-chart-kit";
import StatCard from "./components/StatCard";
import CategoryBadge from "./components/CategoryBadge";
import { useTheme } from "@/app/contexts/ThemeContext";

const { width } = Dimensions.get("window");

export default function ResolutionDetailsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const resolutionId = params.id as string;

  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user && resolutionId) {
      fetchResolutionDetails();
    }
  }, [user, resolutionId]);

  const fetchResolutionDetails = async () => {
    if (!user) return;

    try {
      const [resolutionDoc, fetchedLogs, calculatedStreak] = await Promise.all([
        databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.RESOLUTIONS,
          resolutionId
        ),
        getAllResolutionLogs(user.$id, resolutionId),
        calculateStreak(user.$id, resolutionId),
      ]);

      setResolution({
        $id: resolutionDoc.$id,
        title: resolutionDoc.title,
        category: resolutionDoc.category,
        color: resolutionDoc.color,
        plannedMinutesPerDay: resolutionDoc.plannedMinutesPerDay,
        userId: resolutionDoc.userId,
        isActive: resolutionDoc.isActive,
        startDate: resolutionDoc.startDate,
        icon: resolutionDoc.icon,
      });

      setLogs(fetchedLogs);
      setStreak(calculatedStreak);
    } catch (error) {
      console.error("Error fetching resolution details:", error);
      Alert.alert("Error", "Failed to load resolution details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Resolution",
      `Are you sure you want to delete "${resolution?.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteResolution(resolutionId);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete resolution");
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async () => {
    if (!resolution) return;

    try {
      await updateResolution(resolutionId, {
        isActive: !resolution.isActive,
      });
      setResolution({ ...resolution, isActive: !resolution.isActive });
    } catch (error) {
      Alert.alert("Error", "Failed to update resolution");
    }
  };

  // Calculate stats
  const totalDays = logs.length;
  const completedDays = logs.filter(
    (log) => log.actualMinutes >= (resolution?.plannedMinutesPerDay || 0)
  ).length;
  const totalMinutes = logs.reduce((sum, log) => sum + log.actualMinutes, 0);
  const averageMinutes = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;
  const completionRate =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Prepare chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const chartData = {
    labels: last7Days.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { weekday: "short" });
    }),
    datasets: [
      {
        data: last7Days.map((date) => {
          const log = logs.find((l) => l.date === date);
          return log?.actualMinutes || 0;
        }),
        color: (opacity = 1) => resolution?.color || "#7A9B76",
        strokeWidth: 3,
      },
    ],
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!resolution) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Resolution not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Deleting...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2A2A2A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <MaterialCommunityIcons name="delete-outline" size={24} color="#D32F2F" />
          </TouchableOpacity>
        </View>

        {/* Resolution Info Card */}
        <View style={[styles.infoCard, { borderLeftColor: resolution.color }]}>
          <CategoryBadge category={resolution.category} color={resolution.color} />
          <Text style={styles.title}>{resolution.title}</Text>
          <Text style={styles.goal}>
            Daily Goal: {resolution.plannedMinutesPerDay} minutes
          </Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{streak} day streak!</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard value={totalDays} label="Days Tracked" color={resolution.color} />
          <StatCard value={completedDays} label="Days Completed" color={resolution.color} />
          <StatCard value={totalMinutes} label="Total Minutes" color={resolution.color} />
          <StatCard value={averageMinutes} label="Avg Minutes/Day" color={resolution.color} />
        </View>

        {/* Completion Rate */}
        <View style={styles.completionCard}>
          <Text style={styles.completionLabel}>Completion Rate</Text>
          <Text style={[styles.completionPercent, { color: resolution.color }]}>
            {completionRate}%
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completionRate}%`, backgroundColor: resolution.color },
              ]}
            />
          </View>
        </View>

        {/* Chart */}
        {logs.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Last 7 Days</Text>
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 0,
                color: (opacity = 1) => resolution.color,
                labelColor: (opacity = 1) => "#6A6A6A",
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: resolution.color,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>No logs yet</Text>
            </View>
          ) : (
            logs.slice(0, 10).map((log) => (
              <View key={log.$id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>
                    {new Date(log.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  {log.note && <Text style={styles.historyNote}>{log.note}</Text>}
                </View>
                <View style={styles.historyRight}>
                  <Text
                    style={[
                      styles.historyMinutes,
                      log.actualMinutes >= resolution.plannedMinutesPerDay && {
                        color: resolution.color,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {log.actualMinutes}m
                  </Text>
                  {log.actualMinutes >= resolution.plannedMinutesPerDay && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={resolution.color}
                    />
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Toggle Active Button */}
        <Button
          mode={resolution.isActive ? "outlined" : "contained"}
          buttonColor={resolution.isActive ? undefined : resolution.color}
          textColor={resolution.isActive ? "#6A6A6A" : "#FFFFFF"}
          style={styles.toggleButton}
          onPress={handleToggleActive}
        >
          {resolution.isActive ? "Pause Resolution" : "Resume Resolution"}
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 16 : 60,
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
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  goal: {
    fontSize: 16,
    color: "#6A6A6A",
    marginBottom: 12,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  streakText: {
    fontSize: 14,
    color: "#FF8C42",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  completionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  completionLabel: {
    fontSize: 14,
    color: "#6A6A6A",
    marginBottom: 8,
  },
  completionPercent: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 16,
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  chartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  historySection: {
    marginBottom: 20,
  },
  emptyHistory: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#ACACAC",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 4,
  },
  historyNote: {
    fontSize: 12,
    color: "#6A6A6A",
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyMinutes: {
    fontSize: 16,
    color: "#6A6A6A",
  },
  toggleButton: {
    borderRadius: 12,
    marginBottom: 20,
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
  errorText: {
    fontSize: 16,
    color: "#6A6A6A",
    marginBottom: 20,
  },
});