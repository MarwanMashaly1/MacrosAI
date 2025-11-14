import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const { signIn, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    return "";
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    clearError();
  };

  // Handle form submission
  const handleSignIn = async () => {
    // Validate fields
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    setValidationErrors(errors);

    if (Object.values(errors).some((error) => error !== "")) {
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      // Navigation is handled by AuthProvider
      router.replace("/(tabs)");
    } catch (err: any) {
      // Check if user needs to verify email
      if (err.message.includes("verify your email")) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email address before signing in.",
          [
            {
              text: "Resend Code",
              onPress: () =>
                router.push({
                  pathname: "/auth/confirm-signup",
                  params: { email: formData.email },
                }),
            },
            { text: "OK" },
          ]
        );
      } else {
        Alert.alert("Sign In Failed", err.message || "Please try again");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {validationErrors.email ? (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/forgot-password")}>
                  <Text style={styles.forgotPassword}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password ? (
                <Text style={styles.errorText}>
                  {validationErrors.password}
                </Text>
              ) : null}
            </View>

            {/* Error Message from Auth */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorMessageText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/signup")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#dc2626",
  },
  signInButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signUpText: {
    fontSize: 14,
    color: "#6b7280",
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
});
