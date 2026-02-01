import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { createResolution } from "@/lib/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CategoryBadge from "./components/CategoryBadge";
import TimeSelector from "./components/TimeSelector";

type Category = "Learning" | "Health" | "Creative" | "Fitness" | "Mindful" | "Tech" | "Music";

const CATEGORIES: { name: Category; icon: string }[] = [
  { name: "Learning", icon: "book-open-outline" },
  { name: "Health", icon: "heart-outline" },
  { name: "Creative", icon: "palette-outline" },
  { name: "Fitness", icon: "dumbbell" },
  { name: "Mindful", icon: "meditation" },
  { name: "Tech", icon: "code-tags" },
  { name: "Music", icon: "music-note" },
];

const COLORS = [
  "#7A9B76", // Sage green
  "#6B8E9E", // Sky blue
  "#C89968", // Sand
  "#8B7E74", // Mushroom
  "#8B9B7A", // Moss
  "#7E8B9B", // Slate
  "#9B7E8B", // Mauve
  "#7A9B8B", // Teal
];

const TIME_OPTIONS = [15, 30, 45, 60, 90];

export default function AddResolutionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Learning");
  const [color, setColor] = useState(COLORS[0]);
  const [plannedMinutes, setPlannedMinutes] = useState(30);
  const [customMinutes, setCustomMinutes] = useState("");
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

    setIsLoading(true);
    setError("");

    try {
      await createResolution(user.$id, {
        title: title.trim(),
        category,
        color,
        plannedMinutesPerDay: plannedMinutes,
      });

      // Success! Go back to home
      router.back();
    } catch (err) {
      setError("Failed to create resolution. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomMinutes = (text: string) => {
    setCustomMinutes(text);
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setPlannedMinutes(num);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>NEW RESOLUTION</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="#6A6A6A" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>What do you want to commit to?</Text>

        {/* Title Input */}
        <Text style={styles.label}>Give it a name</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Morning Reading, Practice Piano"
          mode="outlined"
          outlineColor="#7A9B76"
          activeOutlineColor="#7A9B76"
          outlineStyle={{ borderRadius: 16, borderWidth: 2 }}
          style={styles.input}
          disabled={isLoading}
        />

        {/* Category Selection */}
        <Text style={styles.label}>Choose a category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[
                styles.categoryButton,
                category === cat.name && styles.categoryButtonSelected,
              ]}
              onPress={() => setCategory(cat.name)}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={24}
                color={category === cat.name ? "#7A9B76" : "#6A6A6A"}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  category === cat.name && styles.categoryLabelSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color Picker */}
        <Text style={styles.label}>Pick a color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorButton,
                { backgroundColor: c },
                color === c && styles.colorButtonSelected,
              ]}
              onPress={() => setColor(c)}
              disabled={isLoading}
            />
          ))}
        </View>

        {/* Time Goal */}
        <Text style={styles.label}>Daily time goal</Text>
        <TimeSelector
          selectedMinutes={plannedMinutes}
          onSelect={(minutes) => {
            setPlannedMinutes(minutes);
            setCustomMinutes("");
          }}
          options={TIME_OPTIONS}
          color={color}
        />

        <RNTextInput
          value={customMinutes}
          onChangeText={handleCustomMinutes}
          placeholder="Or enter custom minutes..."
          keyboardType="number-pad"
          style={styles.customInput}
          editable={!isLoading}
        />

        {/* Preview */}
        <Text style={styles.label}>Preview</Text>
        <View style={[styles.previewCard, { borderLeftColor: color }]}>
          <CategoryBadge category={category} color={color} />
          <Text style={styles.previewTitle}>{title || "Your resolution name"}</Text>
          <Text style={styles.previewTime}>0m / {plannedMinutes}m</Text>
        </View>

        {/* Error */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Create Button */}
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={isLoading}
          disabled={isLoading || !title.trim()}
          buttonColor="#7A9B76"
          style={styles.createButton}
          labelStyle={styles.createButtonLabel}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 12,
    color: "#6A6A6A",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6A6A6A",
    marginBottom: 12,
    marginTop: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  categoryButton: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 12,
  },
  categoryButtonSelected: {
    borderColor: "#7A9B76",
    backgroundColor: "#F0F5EF",
  },
  categoryLabel: {
    fontSize: 12,
    color: "#6A6A6A",
    marginTop: 6,
  },
  categoryLabelSelected: {
    color: "#7A9B76",
    fontWeight: "500",
  },
  colorGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorButtonSelected: {
    borderColor: "#2A2A2A",
  },
  customInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: "#6A6A6A",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    marginTop: 12,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  previewTime: {
    fontSize: 14,
    color: "#6A6A6A",
  },
  error: {
    color: "#D32F2F",
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },
  createButton: {
    borderRadius: 16,
    marginTop: 24,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 4,
  },
});