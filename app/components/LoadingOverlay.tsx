import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  color?: string;
};

export default function LoadingOverlay({ 
  visible, 
  message = "Loading...", 
  color = "#7A9B76" 
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245, 243, 238, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6A6A6A",
    fontWeight: "500",
  },
});