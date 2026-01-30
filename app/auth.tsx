import { router } from "expo-router";
import { useAuth , AuthProvider} from "../lib/auth-context";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View , StyleSheet, ScrollView} from "react-native";
import { TextInput, Text, Button  , useTheme} from "react-native-paper";

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const theme = useTheme();

    const { signUp, signIn } = useAuth();
    const handleSwitchMode = () => {
        setIsSignUp((prev) => !prev);
    }
    const handleAuth = async () => {
        if(!email || !password) {
            setError("Please fill in all fields");
            return;
        }
       if(password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
       }

        setError(null);

        if(isSignUp) {
          const error = await signUp(email, password);

          if(error) {
            setError(error);
            return;
          }
        }else {
          const error = await signIn(email, password);
          if(error) {
            setError(error);
            return;
          }

          // router.replace("/(tabs)/home");
        }
    };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      {/* Decorative background dots */}
      <View style={styles.decorativeDot1} />
      <View style={styles.decorativeDot2} />
      <View style={styles.decorativeDot3} />
      
      <View style={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.title}>{isSignUp ? "Start your journey" : "Welcome back"}</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "Track your resolutions and watch yourself grow" : "Continue building your daily habits"}
        </Text>

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
        activeOutlineColor="#7A9B76"
        outlineStyle={{ borderRadius: 16, borderWidth: 2 }}
        left={<TextInput.Icon icon="email-outline" color="#ACACAC" />}
        theme={{ colors: { background: 'white' }}}
        value={email}
        onChangeText={setEmail}
        />  

        {/*Password Input*/}
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#ACACAC"
        secureTextEntry
        mode="outlined"
        outlineColor="#E5E5E5"
        activeOutlineColor="#7A9B76"
        outlineStyle={{ borderRadius: 16, borderWidth: 2 }}
        left={<TextInput.Icon icon="lock-outline" color="#ACACAC" />}
        right={<TextInput.Icon icon="eye-outline" color="#ACACAC" />}
        theme={{ colors: { background: 'white' }}}
        value={password}
        onChangeText={setPassword}
        />    
        
        {error ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text> : null}
        
        {/*Signin/Signup Button*/}
        <Button 
          onPress={handleAuth}
          mode="contained" 
          style={styles.primaryButton}
          buttonColor="#7A9B76"
          labelStyle={styles.primaryButtonLabel}
          contentStyle={styles.buttonContent}
        >
          {isSignUp ? "Sign up" : "Sign in"}
        </Button>

        {/* Switch Mode Button */}
        <Button 
          mode="text" 
          onPress={handleSwitchMode}
          labelStyle={styles.switchButtonLabel}
          style={styles.switchButton}
        >
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <Text style={styles.switchButtonHighlight}>
            {isSignUp ? "Sign in" : "Sign up"}
          </Text>
        </Button>
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
  contentContainer: {
    zIndex: 10,
  },
  // Decorative dots matching the design
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
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6A6A6A",
    marginBottom: 32,
    lineHeight: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6A6A6A",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
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
  switchButton: {
    marginTop: 16,
  },
  switchButtonLabel: {
    fontSize: 14,
    color: "#6A6A6A",
  },
  switchButtonHighlight: {
    color: "#7A9B76",
    fontWeight: "500",
  },
})
