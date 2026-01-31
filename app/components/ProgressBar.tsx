import { View, StyleSheet } from "react-native";

type ProgressBarProps = {
  progress: number; // 0-100
  color: string;
  height?: number;
};

export default function ProgressBar({ progress, color, height = 6 }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { height }]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${clampedProgress}%`, 
            backgroundColor: color,
            height 
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 10,
  },
});