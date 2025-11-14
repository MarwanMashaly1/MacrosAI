import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#10B981", "#059669", "#047857"]}
        style={styles.gradient}>
        {/* Logo & Branding */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="nutrition" size={80} color="#ffffff" />
          </View>
          <Text style={styles.appName}>MacrosAI</Text>
          <Text style={styles.tagline}>Your AI-Powered Nutrition Tracker</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="camera"
            title="Snap & Track"
            description="Instantly analyze meals with AI"
          />
          <FeatureItem
            icon="analytics"
            title="Smart Insights"
            description="Understand your nutrition patterns"
          />
          <FeatureItem
            icon="fitness"
            title="Reach Your Goals"
            description="Personalized calorie tracking"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push("/auth/signup")}
            activeOpacity={0.8}>
            <Text style={styles.signUpButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/auth/signin")}
            activeOpacity={0.8}>
            <Text style={styles.signInButtonText}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={28} color="#10B981" />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10B981",
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginTop: height * 0.08,
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  featuresContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  actionsContainer: {
    marginTop: "auto",
    marginBottom: 20,
    gap: 12,
  },
  signUpButton: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  signInButton: {
    padding: 18,
    alignItems: "center",
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  footer: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 20,
  },
});
