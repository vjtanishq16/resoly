import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type TimeSelectorProps = {
  selectedMinutes: number;
  onSelect: (minutes: number) => void;
  options: number[];
  color?: string;
};

export default function TimeSelector({
  selectedMinutes,
  onSelect,
  options,
  color = "#7A9B76",
}: TimeSelectorProps) {
  return (
    <View style={styles.container}>
      {/* Minus button */}
      <TouchableOpacity 
        style={styles.controlButton}
        onPress={() => {
          const currentIndex = options.indexOf(selectedMinutes);
          if (currentIndex > 0) {
            onSelect(options[currentIndex - 1]);
          }
        }}
      >
        <Text style={styles.controlButtonText}>−</Text>
      </TouchableOpacity>

      {/* Time options slider */}
      <View style={styles.sliderContainer}>
        {options.map((minutes) => {
          const isSelected = selectedMinutes === minutes;
          return (
            <TouchableOpacity
              key={minutes}
              style={styles.timeOption}
              onPress={() => onSelect(minutes)}
            >
              <Text
                style={[
                  styles.timeText,
                  isSelected && [styles.timeTextSelected, { color: color }],
                ]}
              >
                {minutes}m
              </Text>
              {isSelected && (
                <View style={[styles.selectedIndicator, { backgroundColor: color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Plus button */}
      <TouchableOpacity 
        style={styles.controlButton}
        onPress={() => {
          const currentIndex = options.indexOf(selectedMinutes);
          if (currentIndex < options.length - 1) {
            onSelect(options[currentIndex + 1]);
          }
        }}
      >
        <Text style={styles.controlButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonText: {
    fontSize: 24,
    color: "#6A6A6A",
    fontWeight: "300",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 8,
  },
  timeOption: {
    alignItems: "center",
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 16,
    color: "#AFAFAF",
    fontWeight: "400",
  },
  timeTextSelected: {
    fontSize: 18,
    fontWeight: "600",
  },
  selectedIndicator: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
});