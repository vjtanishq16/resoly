import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type QuickTimeButtonsProps = {
  onAdd: (minutes: number) => void;
  color?: string;
};

export default function QuickTimeButtons({
  onAdd,
  color = "#7A9B76",
}: QuickTimeButtonsProps) {
  const options = [5, 10, 15, 30, 45, 60];

  return (
    <View style={styles.container}>
      {options.map((minutes) => (
        <TouchableOpacity
          key={minutes}
          style={styles.button}
          onPress={() => onAdd(minutes)}
        >
          <Text style={styles.buttonText}>+{minutes}m</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F5F3F0",
    borderRadius: 24,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 16,
    color: "#6A6A6A",
    fontWeight: "500",
  },
});