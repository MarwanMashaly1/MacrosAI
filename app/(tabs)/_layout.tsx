import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: "Camera",
            tabBarIcon: ({ color }) => (
              <Ionicons name="camera" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => (
              <Ionicons name="time" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null, // Hide from tabs
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
