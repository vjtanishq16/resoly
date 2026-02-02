import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import CategoryBadge from "./components/CategoryBadge";
import { useTheme } from "@/app/contexts/ThemeContext";

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
  const [selectedDay, setSelectedDay] = useState<{ date: string; minutes: number; goal: number } | null>(null);

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
  const totalHours = Math.floor(totalMinutes / 60);
  const completionRate =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Calculate this week's data
  const getThisWeekData = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      const log = logs.find((l) => l.date === dateString);
      
      weekData.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        minutes: log?.actualMinutes || 0,
        isMet: log ? log.actualMinutes >= (resolution?.plannedMinutesPerDay || 0) : false,
      });
    }
    
    return weekData;
  };

  // Generate last 60 days grid (GitHub style)
  const getLast60DaysGrid = () => {
    const grid = [];
    const today = new Date();
    
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      const log = logs.find((l) => l.date === dateString);
      
      let intensity = 0;
      if (log && log.actualMinutes > 0) {
        const percentage = (log.actualMinutes / (resolution?.plannedMinutesPerDay || 1)) * 100;
        if (percentage >= 100) intensity = 3; // Met goal
        else if (percentage >= 50) intensity = 2; // Partial
        else intensity = 1; // Started
      }
      
      grid.push({ date: dateString, intensity });
    }
    
    return grid;
  };

  const thisWeekData = resolution ? getThisWeekData() : [];
  const last60DaysGrid = resolution ? getLast60DaysGrid() : [];
  const thisWeekTotal = thisWeekData.reduce((sum, day) => sum + day.minutes, 0);
  const thisWeekComplete = Math.round((thisWeekTotal / (7 * (resolution?.plannedMinutesPerDay || 1))) * 100);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7A9B76" />
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
          <ActivityIndicator size="large" color="#7A9B76" />
          <Text style={styles.loadingText}>Deleting...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={[styles.heroHeader, { backgroundColor: resolution.color }]}>
          <View style={styles.decorativeBlob} />
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <CategoryBadge category={resolution.category} color="#FFFFFF" />
            <Text style={styles.heroTitle}>{resolution.title}</Text>
            
            {/* Stats Cards Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="chart-line-variant" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statValue}>{thisWeekTotal}m</Text>
                <Text style={styles.statLabel}>{thisWeekComplete}% complete</Text>
              </View>
              
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="fire" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>days</Text>
              </View>
            </View>
          </View>
        </View>

        {/* This Week Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.weekGrid}>
            {thisWeekData.map((day, index) => (
              <View key={index} style={styles.weekDay}>
                <View style={[
                  styles.weekBar,
                  { 
                    height: day.minutes > 0 ? Math.max((day.minutes / (resolution.plannedMinutesPerDay || 1)) * 100, 20) : 8,
                    backgroundColor: day.isMet ? resolution.color : day.minutes > 0 ? `${resolution.color}60` : '#E5E5E5'
                  }
                ]} />
                <Text style={styles.weekMinutes}>{day.minutes}m</Text>
                <Text style={styles.weekLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.weekLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: resolution.color }]} />
              <Text style={styles.legendText}>Met goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: `${resolution.color}60` }]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
          </View>
        </View>

        {/* Last 60 Days - GitHub Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Last 60 Days</Text>
            <View style={styles.intensityLegend}>
              <Text style={styles.intensityLabel}>Less</Text>
              <View style={[styles.intensityBox, { backgroundColor: '#E5E5E5' }]} />
              <View style={[styles.intensityBox, { backgroundColor: `${resolution.color}40` }]} />
              <View style={[styles.intensityBox, { backgroundColor: `${resolution.color}80` }]} />
              <View style={[styles.intensityBox, { backgroundColor: resolution.color }]} />
              <Text style={styles.intensityLabel}>More</Text>
            </View>
          </View>
          
          <View style={styles.contributionGrid}>
            {last60DaysGrid.map((day, index) => {
              let bgColor = '#E5E5E5';
              if (day.intensity === 1) bgColor = `${resolution.color}40`;
              else if (day.intensity === 2) bgColor = `${resolution.color}80`;
              else if (day.intensity === 3) bgColor = resolution.color;
              
              const dayLog = logs.find(l => l.date === day.date);
              const minutes = dayLog?.actualMinutes || 0;
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (minutes > 0) {
                      setSelectedDay({
                        date: day.date,
                        minutes: minutes,
                        goal: resolution.plannedMinutesPerDay
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.contributionBox, { backgroundColor: bgColor }]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Tooltip */}
          {selectedDay && (
            <TouchableOpacity 
              style={styles.tooltipOverlay}
              activeOpacity={1}
              onPress={() => setSelectedDay(null)}
            >
              <View style={[styles.tooltip, { backgroundColor: resolution.color }]}>
                <Text style={styles.tooltipDate}>
                  {new Date(selectedDay.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <Text style={styles.tooltipMinutes}>
                  {selectedDay.minutes} min logged
                </Text>
                <Text style={styles.tooltipGoal}>
                  Goal: {selectedDay.goal} min ({Math.round((selectedDay.minutes / selectedDay.goal) * 100)}%)
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.largeStatCard, { backgroundColor: '#FFF4E6' }]}>
            <MaterialCommunityIcons name="target" size={24} color="#C89968" />
            <Text style={styles.largeStatLabel}>Completion Rate</Text>
            <Text style={[styles.largeStatValue, { color: '#C89968' }]}>{completionRate}%</Text>
          </View>
          
          <View style={[styles.largeStatCard, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#7A9B76" />
            <Text style={styles.largeStatLabel}>Total Hours</Text>
            <Text style={[styles.largeStatValue, { color: '#7A9B76' }]}>{totalHours}h</Text>
          </View>
        </View>

        {/* Motivational Message */}
        {streak >= 3 && (
          <View style={styles.messageCard}>
            <Text style={styles.messageEmoji}>💡</Text>
            <Text style={styles.messageTitle}>Keep it up!</Text>
            <Text style={styles.messageText}>
              You've been consistent this week. Your {streak}-day streak shows real commitment to {resolution.title.toLowerCase()}.
            </Text>
          </View>
        )}

        {/* Toggle Active Button */}
        <Button
          mode={resolution.isActive ? "outlined" : "contained"}
          buttonColor={resolution.isActive ? undefined : resolution.color}
          textColor={resolution.isActive ? "#6A6A6A" : "#FFFFFF"}
          style={styles.toggleButton}
          contentStyle={{ paddingVertical: 8 }}
          onPress={handleToggleActive}
        >
          {resolution.isActive ? "Pause Resolution" : "Resume Resolution"}
        </Button>

        <Button
          mode="text"
          textColor="#D32F2F"
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          Delete Resolution
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
    paddingBottom: 40,
  },
  
  // Hero Header
  heroHeader: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  decorativeBlob: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 20,
    zIndex: 2,
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "500",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "400",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  
  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  
  // This Week
  weekGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  weekDay: {
    alignItems: "center",
    flex: 1,
  },
  weekBar: {
    width: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  weekMinutes: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 4,
  },
  weekLabel: {
    fontSize: 11,
    color: "#8A8A8A",
  },
  weekLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: "#6A6A6A",
  },
  
  // GitHub-style contribution grid
  intensityLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  intensityLabel: {
    fontSize: 11,
    color: "#8A8A8A",
    marginHorizontal: 4,
  },
  intensityBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  contributionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  contributionBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  tooltipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tooltip: {
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tooltipMinutes: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tooltipGoal: {
    fontSize: 14,
    color: '#FFFFFFCC',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  largeStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "flex-start",
  },
  largeStatLabel: {
    fontSize: 13,
    color: "#6A6A6A",
    marginTop: 8,
    marginBottom: 8,
  },
  largeStatValue: {
    fontSize: 32,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  
  // Message Card
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#7A9B76",
  },
  messageEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: "#6A6A6A",
    lineHeight: 20,
  },
  
  // Buttons
  toggleButton: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  deleteButton: {
    marginHorizontal: 20,
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