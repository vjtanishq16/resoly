import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { logTime } from "@/lib/database";
import CircularProgress from "./components/CircularProgress";
import QuickTimeButtons from "./components/QuickTimeButtons";

type LogTimeModalProps = {
  visible: boolean;
  onClose: () => void;
  resolution: {
    id: string;
    title: string;
    color: string;
    plannedMinutes: number;
    actualMinutes: number;
  };
  userId: string;
  onSuccess?: () => void;
};

export default function LogTimeModal({
  visible,
  onClose,
  resolution,
  userId,
  onSuccess,
}: LogTimeModalProps) {
  const [minutes, setMinutes] = useState(resolution.actualMinutes || 0);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTime = (additionalMinutes: number) => {
    setMinutes(prev => Math.max(0, prev + additionalMinutes));
  };

  const handleDirectInput = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setMinutes(numValue);
    } else if (value === "") {
      setMinutes(0);
    }
  };

  const handleSave = async () => {
    if (minutes <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of minutes");
      return;
    }

    setIsSaving(true);
    try {
      await logTime(
        userId,
        resolution.id,
        minutes,
        note.trim() || undefined
      );
      
      setMinutes(0);
      setNote("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error logging progress:", error);
      Alert.alert("Error", "Failed to log progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <View style={[styles.categoryDot, { backgroundColor: resolution.color }]} />
              <Text style={styles.categoryText}>{resolution.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Circular Progress */}
          <CircularProgress
            minutes={minutes}
            goal={resolution.plannedMinutes}
            color={resolution.color}
          />

          {/* Manual Input with +/- 5 buttons */}
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => handleAddTime(-5)}
            >
              <Text style={styles.controlButtonText}>−</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.minutesInput}
              value={String(minutes)}
              onChangeText={handleDirectInput}
              keyboardType="number-pad"
              editable={!isSaving}
            />

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => handleAddTime(5)}
            >
              <Text style={styles.controlButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Time Buttons */}
          <QuickTimeButtons onAdd={handleAddTime} color={resolution.color} />

          {/* Note Input */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Add a note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="How did it go?"
              placeholderTextColor="#AFAFAF"
              value={note}
              onChangeText={setNote}
              multiline
              editable={!isSaving}
            />
          </View>

          {/* Save Button - NOW USES RESOLUTION COLOR */}
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { backgroundColor: resolution.color }, // Dynamic color!
              isSaving && styles.saveButtonDisabled
            ]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Progress"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 14,
    color: "#6A6A6A",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#6A6A6A",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginVertical: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonText: {
    fontSize: 28,
    color: "#6A6A6A",
    fontWeight: "300",
  },
  minutesInput: {
    fontSize: 48,
    fontWeight: "600",
    color: "#2D2D2D",
    textAlign: "center",
    minWidth: 100,
    paddingHorizontal: 8,
  },
  noteSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 14,
    color: "#6A6A6A",
    marginBottom: 8,
    fontWeight: "500",
  },
  noteInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#2D2D2D",
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    // backgroundColor is now set dynamically via inline style
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});