import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
} from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { createResolution } from "@/lib/database";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Category options with icons
const CATEGORIES = [
  { name: "Learning", icon: "book-open-outline", emoji: "📖" },
  { name: "Health", icon: "heart-outline", emoji: "❤️" },
  { name: "Creative", icon: "palette-outline", emoji: "🎨" },
  { name: "Fitness", icon: "dumbbell", emoji: "💪" },
  { name: "Mindful", icon: "meditation", emoji: "🧘" },
  { name: "Tech", icon: "laptop", emoji: "💻" },
  { name: "Music", icon: "music", emoji: "🎵" },
];

// Color options
const COLORS = [
  "#7A9B76", // Green
  "#6B8E9E", // Blue
  "#C89968", // Orange
  "#9B8B7E", // Brown
  "#8B9B7A", // Sage
  "#7E8B9B", // Slate
  "#B8A8C8", // Purple
  "#C8A8B8", // Pink
];

// Time options
const TIME_OPTIONS = [15, 30, 45, 60, 90];

export default function AddResolutionScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Learning");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedTime, setSelectedTime] = useState(30);
  const [customTime, setCustomTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    // Validation
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!user) {
      setError("You must be logged in");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const timeToUse = customTime ? parseInt(customTime) : selectedTime;

      await createResolution(user.$id, {
        title: title.trim(),
        category: selectedCategory,
        color: selectedColor,
        plannedMinutesPerDay: timeToUse,
      });

      // Navigate back and refresh
      router.back();
    } catch (err) {
      console.error("Error creating resolution:", err);
      setError("Failed to create resolution. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7A9B76" />
          <Text style={styles.loadingText}>Creating resolution...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>NEW RESOLUTION</Text>
          <Text style={styles.headerTitle}>What do you want to commit to?</Text>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Give it a name</Text>
          <RNTextInput
            style={styles.input}
            placeholder="e.g., Morning Reading, Practice Piano"
            placeholderTextColor="#ACACAC"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Choose a category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.name && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.name && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Pick a color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonActive,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Goal */}
        <View style={styles.section}>
          <Text style={styles.label}>Daily time goal</Text>
          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && !customTime && styles.timeButtonActive,
                ]}
                onPress={() => {
                  setSelectedTime(time);
                  setCustomTime("");
                }}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    selectedTime === time && !customTime && styles.timeButtonTextActive,
                  ]}
                >
                  {time}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <RNTextInput
            style={[styles.input, styles.customTimeInput]}
            placeholder="Or enter custom minutes..."
            placeholderTextColor="#ACACAC"
            value={customTime}
            onChangeText={setCustomTime}
            keyboardType="number-pad"
          />
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.previewCard}>
            <View
              style={[
                styles.previewCategoryBadge,
                { backgroundColor: `${selectedColor}20` },
              ]}
            >
              <Text style={[styles.previewCategoryText, { color: selectedColor }]}>
                {selectedCategory.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.previewTitle}>
              {title || "Your resolution name"}
            </Text>
            <Text style={styles.previewTime}>
              0m / {customTime || selectedTime}m
            </Text>
          </View>
        </View>

        {/* Error */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Create Button */}
        <Button
          mode="contained"
          buttonColor="#7A9B76"
          style={styles.createButton}
          labelStyle={styles.createButtonLabel}
          onPress={handleCreate}
          disabled={isLoading}
          loading={isLoading}
        >
          Create Resolution
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  headerLabel: {
    fontSize: 12,
    color: "#6A6A6A",
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2A2A2A",
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6A6A6A",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2A2A2A",
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryButton: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  categoryButtonActive: {
    borderColor: "#7A9B76",
    backgroundColor: "#F0F7EE",
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: "#6A6A6A",
    fontWeight: "500",
  },
  categoryNameActive: {
    color: "#7A9B76",
    fontWeight: "600",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorButtonActive: {
    borderColor: "#2A2A2A",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  timeButtonActive: {
    borderColor: "#7A9B76",
    backgroundColor: "#F0F7EE",
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6A6A6A",
  },
  timeButtonTextActive: {
    color: "#7A9B76",
    fontWeight: "600",
  },
  customTimeInput: {
    marginTop: 8,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  previewCategoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  previewCategoryText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  previewTime: {
    fontSize: 14,
    color: "#6A6A6A",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  createButton: {
    borderRadius: 16,
    marginBottom: 40,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 6,
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