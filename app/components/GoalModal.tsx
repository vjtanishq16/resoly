import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import CircularProgress from "./CircularProgress";
import TimeSelector from "./TimeSelector";
import QuickTimeButtons from "./QuickTimeButtons";

type GoalModalProps = {
  visible: boolean;
  onClose: () => void;
  goalName: string;
  goalMinutes: number;
  color: string;
  onSave?: (minutes: number, note: string) => void;
};

export default function GoalModal({
  visible,
  onClose,
  goalName,
  goalMinutes,
  color,
  onSave,
}: GoalModalProps) {
  const [minutes, setMinutes] = useState(15);
  const [note, setNote] = useState("");
  
  const timeOptions = [5, 15, 30, 45, 60];

  const handleAddTime = (additionalMinutes: number) => {
    setMinutes(minutes + additionalMinutes);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(minutes, note);
    }
    setMinutes(15);
    setNote("");
    onClose();
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
              <View style={[styles.categoryDot, { backgroundColor: color }]} />
              <Text style={styles.categoryText}>{goalName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Circular Progress */}
          <CircularProgress
            minutes={minutes}
            goal={goalMinutes}
            color={color}
          />

          {/* Time Selector with +/- buttons */}
          <TimeSelector
            selectedMinutes={minutes}
            onSelect={setMinutes}
            options={timeOptions}
            color={color}
          />

          {/* Quick Time Buttons */}
          <QuickTimeButtons onAdd={handleAddTime} color={color} />

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
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Progress</Text>
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
    backgroundColor: "#C8956E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});