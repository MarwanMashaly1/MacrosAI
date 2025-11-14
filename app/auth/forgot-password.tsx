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

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return "";
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setEmail(value);
    setValidationError("");
  };

  // Handle form submission
  const handleSendCode = async () => {
    const error = validateEmail(email);

    if (error) {
      setValidationError(error);
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);

      Alert.alert(
        "Check Your Email",
        "We've sent a password reset code to your email address.",
        [
          {
            text: "OK",
            onPress: () => {
              router.push({
                pathname: "/auth/reset-password",
                params: { email },
              });
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
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

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={64} color="#10B981" />
          </View>

          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you a reset code.
            </Text>
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
                  value={email}
                  onChangeText={handleInputChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  autoFocus
                  onSubmitEditing={handleSendCode}
                />
              </View>
              {validationError ? (
                <Text style={styles.errorText}>{validationError}</Text>
              ) : null}
            </View>

            {/* Send Code Button */}
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.sendButtonText}>Send Reset Code</Text>
                  <Ionicons name="send" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Back to Sign In */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6b7280"
            />
            <Text style={styles.helpText}>
              If you don't receive an email within a few minutes, check your
              spam folder.
            </Text>
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
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
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
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  sendButton: {
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
  sendButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signInText: {
    fontSize: 14,
    color: "#6b7280",
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 32,
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
