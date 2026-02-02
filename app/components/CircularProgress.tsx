import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CircularProgressProps = {
  minutes: number;
  goal: number;
  color?: string;
};

export default function CircularProgress({
  minutes,
  goal,
  color = "#7A9B76",
}: CircularProgressProps) {
  const size = 240;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((minutes / goal) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0EDE8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.minutesText}>{minutes}</Text>
        <Text style={styles.labelText}>minutes</Text>
        <Text style={styles.goalText}>of {goal}m goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
  },
  minutesText: {
    fontSize: 72,
    fontWeight: "700",
    color: "#2D2D2D",
    letterSpacing: -2,
  },
  labelText: {
    fontSize: 16,
    color: "#8A8A8A",
    fontWeight: "400",
    marginTop: -8,
  },
  goalText: {
    fontSize: 14,
    color: "#AFAFAF",
    fontWeight: "400",
    marginTop: 4,
  },
});