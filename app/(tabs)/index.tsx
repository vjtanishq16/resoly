import { Text, View, StyleSheet } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export default function Index() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    if (signOut) {
      await signOut();
    }
    setIsSigningOut(false);
  };

  return (
    <View style={styles.View}>
      {/* Loading Overlay */}
      {isSigningOut && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7A9B76" />
          <Text style={styles.loadingText}>Signing you out...</Text>
        </View>
      )}
      
      <Text style={styles.greeting}>Hi there</Text>
      <Button 
        mode="contained" 
        icon={"logout"} 
        onPress={handleSignOut}
        loading={isSigningOut}
        disabled={isSigningOut}
        buttonColor="#7A9B76"
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  View: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3EE",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 24,
  },
  signOutButton: {
    paddingHorizontal: 24,
    borderRadius: 16,
  },
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