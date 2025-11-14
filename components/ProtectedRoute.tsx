import { useAuth } from "@/hooks/useAuth";
import { router, useSegments } from "expo-router";
import React, { ReactNode, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth" || segments[0] === "welcome";
    const inProtectedGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inProtectedGroup) {
      // Redirect to welcome if trying to access protected routes
      router.replace("/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated user tries to access auth routes
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});
