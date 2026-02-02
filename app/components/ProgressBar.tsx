import { View, StyleSheet } from "react-native";

type ProgressBarProps = {
  progress: number; // 0-100
  color: string;
  totalSegments?: number;
  height?: number;
};

export default function ProgressBar({ 
  progress, 
  color, 
  totalSegments = 6,
  height = 6 
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const filledSegments = Math.floor((clampedProgress / 100) * totalSegments);

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSegments }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            { 
              height,
              backgroundColor: index < filledSegments ? color : "#E5E5E5",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    width: "100%",
  },
  segment: {
    flex: 1,
    borderRadius: 4,
  },
});