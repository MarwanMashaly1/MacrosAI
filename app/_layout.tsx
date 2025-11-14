import outputs from "@/amplify_outputs.json";
import { AuthProvider } from "@/components/AuthProvider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Configure Amplify
Amplify.configure(outputs);

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Public Routes - No Auth Required */}
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/confirm-signup"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/reset-password"
            options={{ headerShown: false }}
          />

          {/* Protected Routes - Auth Required */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen name="identify" options={{ headerShown: false }} />
          <Stack.Screen name="results" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-entry-manual"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="add-entry-date"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
