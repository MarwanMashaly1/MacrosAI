// IMPORTANT: Import polyfills FIRST before anything else
import "../polyfills";

import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Keep showing splash screen
    }

    const inAuthGroup = segments[0] === "(auth)";

    // If the user is signed in but is in the auth group, redirect to the main app.
    if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
    // If the user is NOT signed in AND is NOT in the auth group, redirect to the welcome screen.
    else if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    }

    SplashScreen.hideAsync();
  }, [isLoading, isLoggedIn, segments, router]);

  // The <Slot /> component will render the correct route group.
  return <Slot />;
}

export default function AppLayout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
