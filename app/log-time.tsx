import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput as RNTextInput,
  Animated,
  Dimensions,
} from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { logTime } from "@/lib/database";

const { width } = Dimensions.get("window");

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
  onSuccess: () => void;
};

export default function LogTimeModal({
  visible,
  onClose,
  resolution,
  userId,
  onSuccess,
}: LogTimeModalProps) {
  const [minutes, setMinutes] = useState(resolution.actualMinutes.toString());
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const progress = Math.min(
    (parseInt(minutes) || 0) / resolution.plannedMinutes,
    1
  );

  const quickTimeOptions = [5, 10, 15, 30, 45, 60];

  const handleQuickTime = (addMinutes: number) => {
    const current = parseInt(minutes) || 0;
    const newTime = Math.max(0, current + addMinutes);
    setMinutes(newTime.toString());
  };

  const handleSave = async () => {
    const timeValue = parseInt(minutes) || 0;
    
    if (timeValue < 0) {
      return;
    }

    setIsLoading(true);
    try {
      await logTime(userId, resolution.id, timeValue, note.trim() || undefined);
      onSuccess();
      onClose();
      // Reset for next time
      setNote("");
    } catch (error) {
      console.error("Error logging time:", error);
      alert("Failed to log time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View
                style={[styles.colorDot, { backgroundColor: resolution.color }]}
              />
              <Text style={styles.modalTitle}>{resolution.title}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#6A6A6A" />
            </TouchableOpacity>
          </View>

          {/* Circular Progress */}
          <View style={styles.progressSection}>
            <View style={styles.circularProgressContainer}>
              {/* Background circle */}
              <View style={styles.circularProgressBg} />

              {/* Progress circle - simplified for now */}
              <View
                style={[
                  styles.circularProgressFill,
                  {
                    backgroundColor: resolution.color,
                    opacity: progress > 0 ? 0.2 : 0,
                  },
                ]}
              />

              {/* Center text */}
              <View style={styles.progressCenter}>
                <Text style={styles.progressMinutes}>{minutes}</Text>
                <Text style={styles.progressLabel}>minutes</Text>
                <Text style={styles.progressGoal}>
                  of {resolution.plannedMinutes}m goal
                </Text>
              </View>
            </View>
          </View>

          {/* Time adjustment buttons */}
          <View style={styles.adjustmentSection}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleQuickTime(-5)}
            >
              <MaterialCommunityIcons name="minus" size={24} color="#6A6A6A" />
            </TouchableOpacity>

            <RNTextInput
              style={styles.timeInput}
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
              selectTextOnFocus
            />

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleQuickTime(5)}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#6A6A6A" />
            </TouchableOpacity>
          </View>

          {/* Quick time buttons */}
          <View style={styles.quickTimeSection}>
            {quickTimeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={styles.quickTimeButton}
                onPress={() => handleQuickTime(time)}
              >
                <Text style={styles.quickTimeText}>+{time}m</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note input */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Add a note (optional)</Text>
            <RNTextInput
              style={styles.noteInput}
              placeholder="How did it go?"
              placeholderTextColor="#ACACAC"
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
            />
          </View>

          {/* Save button */}
          <Button
            mode="contained"
            buttonColor={resolution.color}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
            onPress={handleSave}
            disabled={isLoading}
            loading={isLoading}
          >
            Save Progress
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2A2A2A",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  progressSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  circularProgressContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circularProgressBg: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F5F3EE",
  },
  circularProgressFill: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  progressCenter: {
    alignItems: "center",
  },
  progressMinutes: {
    fontSize: 56,
    fontWeight: "700",
    color: "#2A2A2A",
    letterSpacing: -2,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6A6A6A",
    marginBottom: 4,
  },
  progressGoal: {
    fontSize: 12,
    color: "#ACACAC",
  },
  adjustmentSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F3EE",
    justifyContent: "center",
    alignItems: "center",
  },
  timeInput: {
    width: 100,
    height: 56,
    backgroundColor: "#F5F3EE",
    borderRadius: 16,
    fontSize: 32,
    fontWeight: "600",
    color: "#2A2A2A",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  quickTimeSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  quickTimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F5F3EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  quickTimeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6A6A6A",
  },
  noteSection: {
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6A6A6A",
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: "#F5F3EE",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#2A2A2A",
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    borderRadius: 16,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 6,
  },
});