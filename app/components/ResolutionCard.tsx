import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProgressBar from "./ProgressBar";

type ResolutionCardProps = {
  resolution: {
    title: string;
    category: string;
    color: string;
    actualMinutes: number;
    plannedMinutes: number;
    streak: number;
  };
  onPress?: () => void;
  onLogTime?: () => void;
};

export default function ResolutionCard({ resolution, onPress, onLogTime }: ResolutionCardProps) {
  const progress = (resolution.actualMinutes / resolution.plannedMinutes) * 100;
  const isComplete = progress >= 100;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: `${resolution.color}20` }]}>
        <Text style={[styles.categoryText, { color: resolution.color }]}>
          {resolution.category.toUpperCase()}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{resolution.title}</Text>

      {/* Time Info */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>
          {resolution.actualMinutes}m / {resolution.plannedMinutes}m
        </Text>
        
        {/* Streak */}
        {resolution.streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{resolution.streak} days</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <ProgressBar progress={progress} color={resolution.color} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, isComplete && styles.actionButtonDisabled]}
          onPress={onLogTime}
          disabled={isComplete}
        >
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={18} 
            color={isComplete ? "#ACACAC" : "#7A9B76"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <MaterialCommunityIcons name="chart-line" size={18} color="#7A9B76" />
        </TouchableOpacity>
      </View>

      {/* Checkmark for completed */}
      {isComplete && (
        <View style={styles.completeBadge}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#7A9B76" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#6A6A6A",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F3EE",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  completeBadge: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});