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
      {options.map((minutes) => (
        <TouchableOpacity
          key={minutes}
          style={[
            styles.button,
            selectedMinutes === minutes && [styles.buttonSelected, { backgroundColor: color, borderColor: color }],
          ]}
          onPress={() => onSelect(minutes)}
        >
          <Text
            style={[
              styles.buttonText,
              selectedMinutes === minutes && styles.buttonTextSelected,
            ]}
          >
            {minutes}m
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  buttonSelected: {
    backgroundColor: "#7A9B76",
    borderColor: "#7A9B76",
  },
  buttonText: {
    fontSize: 14,
    color: "#6A6A6A",
    fontWeight: "500",
  },
  buttonTextSelected: {
    color: "#FFFFFF",
  },
});
