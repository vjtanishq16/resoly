import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
 
function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    if (isLoadingUser || isNavigating) return;
    
    const inAuthGroup = segments[0] === "auth";
    
    const navigate = async () => {
      setIsNavigating(true);
      
      if (!user && !inAuthGroup) {
        await router.replace('/auth');
      } else if (user && inAuthGroup) {
        await router.replace('/');
      }
      
      setIsNavigating(false);
    };
    
    navigate();
  }, [user, isLoadingUser, segments]);
  
  if (isLoadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3EE' }}>
        <ActivityIndicator size="large" color="#7A9B76" />
      </View>
    );
  }
  
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouteGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="index" />
            <Stack.Screen 
              name="add-resolution" 
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: '',
                headerStyle: { backgroundColor: '#F5F3EE' }, // Static color
              }}
            />
            <Stack.Screen 
              name="log-time" 
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: '',
                headerStyle: { backgroundColor: '#F5F3EE' }, // Static color
              }}
            />
            <Stack.Screen name="profile" />
            <Stack.Screen 
              name="settings/appearance" 
              options={{
                headerShown: true,
                headerTitle: 'Appearance',
                presentation: 'card',
              }}
            />
            <Stack.Screen 
              name="settings/notifications" 
              options={{
                headerShown: true,
                headerTitle: 'Notifications',
                presentation: 'card',
              }}
            />
            <Stack.Screen 
              name="settings/help" 
              options={{
                headerShown: true,
                headerTitle: 'Help & Support',
                presentation: 'card',
              }}
            />
            <Stack.Screen 
              name="settings/about" 
              options={{
                headerShown: true,
                headerTitle: 'About',
                presentation: 'card',
              }}
            />
          </Stack>
        </RouteGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
