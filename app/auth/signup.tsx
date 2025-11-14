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

export default function SignUpScreen() {
  const { signUp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = [
    "#ef4444",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#10b981",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[a-z]/.test(password))
      return "Password must contain lowercase letter";
    if (!/[A-Z]/.test(password))
      return "Password must contain uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    if (!/[^A-Za-z0-9]/.test(password))
      return "Password must contain a special character";
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== formData.password) return "Passwords do not match";
    return "";
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    clearError();
  };

  // Handle form submission
  const handleSignUp = async () => {
    // Validate all fields
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };

    setValidationErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some((error) => error !== "")) {
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name);
      // Navigate to confirmation screen
      router.push({
        pathname: "/auth/confirm-signup",
        params: { email: formData.email },
      });
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message || "Please try again");
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {validationErrors.name ? (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              ) : null}
            </View>

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
                />
              </View>
              {validationErrors.email ? (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
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

              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[...Array(5)].map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              index < passwordStrength
                                ? strengthColors[passwordStrength - 1]
                                : "#e5e7eb",
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      {
                        color:
                          strengthColors[passwordStrength - 1] || "#6b7280",
                      },
                    ]}>
                    {passwordStrength > 0
                      ? strengthLabels[passwordStrength - 1]
                      : ""}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleInputChange("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}>
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword ? (
                <Text style={styles.errorText}>
                  {validationErrors.confirmPassword}
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

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/signin")}>
                <Text style={styles.signInLink}>Sign In</Text>
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
    marginBottom: 32,
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
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
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
  signUpButton: {
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
  signUpButtonText: {
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
});
