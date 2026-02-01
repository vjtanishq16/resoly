import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { TextInput, Text, Button, useTheme, ActivityIndicator } from "react-native-paper";
import { useTheme as useAppTheme } from "@/app/contexts/ThemeContext";

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [name, setName] = useState("");

    const theme = useTheme();
    const { colors } = useAppTheme();
    const { signUp, signIn } = useAuth();
    
    const handleSwitchMode = () => {
        setIsSignUp((prev) => !prev);
        setError(null);
    }
    const handleAuth = async () => {
  setError("");
  setIsLoading(true);

  try {
    let errorMessage;
    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your name");
        setIsLoading(false);
        return;
      }
      errorMessage = await signUp(email, password, name);
    } else {
      errorMessage = await signIn(email, password);
    }
    
    if (errorMessage) {
      setError(errorMessage);
    }
  } catch (err: any) {
    setError(err.message || "An error occurred");
  } finally {
    setIsLoading(false);
  }
};

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {isSignUp ? "Creating your account..." : "Signing you in..."}
                    </Text>
                </View>
            )}
            
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Decorative dots */}
                <View style={styles.decorativeDot1} />
                <View style={styles.decorativeDot2} />
                <View style={styles.decorativeDot3} />
                
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoRow}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoEmoji}>🌱</Text>
                        </View>
                        <View>
                            <Text style={styles.appName}>resoly</Text>
                            <Text style={styles.appTagline}>grow daily</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>
                        {isSignUp ? "Start your journey" : "Welcome back"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSignUp 
                            ? "Track your resolutions and watch yourself grow" 
                            : "Continue building your daily habits"}
                    </Text>
                </View>
                
                <View style={styles.contentContainer}>
                    {/* Name Input - Only for Sign Up */}
                    {isSignUp && (
                        <>
                            <Text style={styles.inputLabel}>Full name</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="words"
                                placeholder="John Doe"
                                placeholderTextColor="#ACACAC"
                                mode="outlined"
                                outlineColor="#E5E5E5"
                                activeOutlineColor={colors.primary}
                                outlineStyle={{ borderRadius: 16, borderWidth: 2 }}
                                left={<TextInput.Icon icon="account-outline" color="#ACACAC" />}
                                theme={{ colors: { background: 'white' }}}
                                value={name}
                                onChangeText={setName}
                                disabled={isLoading}
                            />
                        </>
                    )}

                    {/* Email Input */}
                    <Text style={styles.inputLabel}>Email address</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none" 
                        keyboardType="email-address"
                        placeholder="you@example.com"
                        placeholderTextColor="#ACACAC"
                        mode="outlined"
                        outlineColor="#E5E5E5"
                        activeOutlineColor={colors.primary}
                        outlineStyle={{ borderRadius: 16, borderWidth: 2 }}
                        left={<TextInput.Icon icon="email-outline" color="#ACACAC" />}
                        theme={{ colors: { background: 'white' }}}
                        value={email}
                        onChangeText={setEmail}
                        disabled={isLoading}
                    />  

                    {/* Password Input */}
                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#ACACAC"
                        secureTextEntry={!showPassword}
                        mode="outlined"
                        outlineColor="#E5E5E5"
                        activeOutlineColor={colors.primary}
                        outlineStyle={{ borderRadius: 16, borderWidth: 2 }}
                        left={<TextInput.Icon icon="lock-outline" color="#ACACAC" />}
                        right={
                            <TextInput.Icon 
                                icon={showPassword ? "eye-off-outline" : "eye-outline"} 
                                color="#ACACAC"
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        theme={{ colors: { background: 'white' }}}
                        value={password}
                        onChangeText={setPassword}
                        disabled={isLoading}
                    />
                    
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    
                    {/* Primary Button */}
                    <Button 
                        onPress={handleAuth}
                        mode="contained" 
                        style={styles.primaryButton}
                        buttonColor={colors.primary}
                        labelStyle={styles.primaryButtonLabel}
                        contentStyle={styles.buttonContent}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isSignUp ? "Sign up" : "Sign in"}
                    </Button>

                    {/* Switch Mode */}
                    <TouchableOpacity 
                        onPress={handleSwitchMode}
                        style={styles.switchModeContainer}
                        disabled={isLoading}
                    >
                        <Text style={styles.switchModeText}>
                            {isSignUp ? "Already have an account? " : "Don't have an account? "}
                            <Text style={styles.switchModeHighlight}>
                                {isSignUp ? "Sign in" : "Sign up"}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  logoSection: {
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#7A9B76",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7A9B76",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ rotate: '3deg' }],
  },
  logoEmoji: {
    fontSize: 28,
  },
  appName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#2A2A2A",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: "#8A8A8A",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6A6A6A",
    lineHeight: 24,
  },
  contentContainer: {
    zIndex: 10,
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
  decorativeDot1: {
    position: "absolute",
    top: 80,
    right: 48,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7A9B76",
    opacity: 0.4,
  },
  decorativeDot2: {
    position: "absolute",
    top: 128,
    right: 96,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C89968",
    opacity: 0.3,
  },
  decorativeDot3: {
    position: "absolute",
    bottom: 160,
    left: 32,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6B8E9E",
    opacity: 0.35,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6A6A6A",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  errorText: {
    color: "#D32F2F",
    marginBottom: 8,
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#7A9B76",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  switchModeContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  switchModeText: {
    fontSize: 14,
    color: "#6A6A6A",
  },
  switchModeHighlight: {
    color: "#7A9B76",
    fontWeight: "500",
  },
});