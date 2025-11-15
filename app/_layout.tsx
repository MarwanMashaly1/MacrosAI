// IMPORTANT: Import polyfills FIRST before anything else
import "../polyfills";

import { AuthProvider } from "@/components/AuthProvider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Amplify Configuration for Expo Go (Web-compatible)
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-2_yHAaqYBhL",
      userPoolClientId: "2vkmvdsvfmf57ceu0m30oc56v9",
      signUpVerificationMethod: "code",
      loginWith: {
        email: true,
      },
      userAttributes: {
        name: {
          required: true,
        },
        email: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 6,
        requireLowercase: false,
        requireUppercase: false,
        requireNumbers: false,
        requireSpecialCharacters: false,
      },
    },
  },
};

console.log("✅ Amplify config:", JSON.stringify(amplifyConfig, null, 2));

try {
  Amplify.configure(amplifyConfig);
  console.log("✅ Amplify configured successfully for Expo Go");
} catch (error) {
  console.error("❌ Amplify configuration failed:", error);
}

export const unstable_settings = {
  initialRouteName: "welcome", // Changed from "index" to fix warning
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Auth Routes */}
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/reset-password"
            options={{ headerShown: false }}
          />

          {/* Protected Routes */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
