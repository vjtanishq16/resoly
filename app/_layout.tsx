import { Stack , useRouter} from "expo-router";
import { useEffect } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = false;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  });
  return <>{children}</>;
}

export default function RootLayout() {
  const isAuthenticated = false;

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen name="auth" options={{ headerShown: true }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
