import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useTheme } from "@/app/contexts/ThemeContext";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({ 
  visible, 
  message = "Loading...",
}: LoadingOverlayProps) {
  const { colors } = useTheme();
  
  if (!visible) return null;

  return (
    <View style={[styles.loadingOverlay, { backgroundColor: colors.background + 'F2' }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{message}</Text>
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
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
});