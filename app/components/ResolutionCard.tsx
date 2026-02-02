import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  isFirst?: boolean; // First card gets special treatment
};

export default function ResolutionCard({ 
  resolution, 
  onPress, 
  onLogTime,
  isFirst = false 
}: ResolutionCardProps) {
  const progress = (resolution.actualMinutes / resolution.plannedMinutes) * 100;
  const isComplete = progress >= 100;
  
  // Calculate segments for first card (7 segments based on design)
  const totalSegments = 7;
  const segmentValue = resolution.plannedMinutes / totalSegments;
  const filledSegments = Math.min(
    Math.floor(resolution.actualMinutes / segmentValue),
    totalSegments
  );

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isFirst && styles.cardFirst
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left border color indicator */}
      <View style={[styles.leftBorder, { backgroundColor: resolution.color }]} />
      
      <View style={styles.content}>
        {/* Left side - content */}
        <View style={styles.leftContent}>
          {/* Category badge with dot */}
          <View style={styles.categoryRow}>
            <View style={[styles.dot, { backgroundColor: resolution.color }]} />
            <Text style={styles.categoryText}>{resolution.category.toUpperCase()}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{resolution.title}</Text>

          {/* Time and streak */}
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>
              {resolution.actualMinutes}m / {resolution.plannedMinutes}m
            </Text>
            {resolution.streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{resolution.streak} days</Text>
              </View>
            )}
          </View>

          {/* Progress - segmented for first card, solid bar for others */}
          {isFirst ? (
            <View style={styles.segmentedProgress}>
              {Array.from({ length: totalSegments }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: i < filledSegments 
                        ? resolution.color 
                        : '#E8E8E8'
                    }
                  ]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: resolution.color 
                  }
                ]} 
              />
            </View>
          )}
        </View>

        {/* Right side - action button or checkmark */}
        <View style={styles.rightContent}>
          {isComplete ? (
            <View style={[styles.checkCircle, { backgroundColor: resolution.color }]}>
              <MaterialCommunityIcons name="check" size={22} color="#FFFFFF" />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.clockButton}
              onPress={(e) => {
                e.stopPropagation();
                onLogTime?.();
              }}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons name="clock-outline" size={26} color="#ACACAC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* View detailed progress link - only for first card */}
      {isFirst && (
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.detailsText}>View detailed progress</Text>
          <MaterialCommunityIcons name="trending-up" size={16} color="#6A6A6A" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
    position: "relative",
  },
  cardFirst: {
    marginBottom: 16,
  },
  leftBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    paddingLeft: 20,
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8A8A8A",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 19,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  timeText: {
    fontSize: 14,
    color: "#6A6A6A",
    fontWeight: "400",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    color: "#FF8C42",
    fontWeight: "600",
  },
  segmentedProgress: {
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  rightContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  clockButton: {
    width: 44,
    height: 44,
    backgroundColor: "#F5F3EE",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F5F3EE",
  },
  detailsText: {
    fontSize: 14,
    color: "#6A6A6A",
    fontWeight: "400",
  },
});