import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { confirmResetPassword, resetPassword } = useAuth();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthColors = [
    "#ef4444",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#10b981",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setValidationErrors((prev) => ({ ...prev, code: "" }));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {
      code: "",
      newPassword: "",
      confirmPassword: "",
    };

    const codeString = code.join("");
    if (codeString.length !== 6) {
      errors.code = "Please enter the 6-digit code";
    }

    if (!newPassword) {
      errors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (!/[a-z]/.test(newPassword)) {
      errors.newPassword = "Password must contain lowercase letter";
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = "Password must contain uppercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = "Password must contain a number";
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      errors.newPassword = "Password must contain a special character";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const codeString = code.join("");
      await confirmResetPassword(email, codeString, newPassword);

      Alert.alert(
        "Success! 🎉",
        "Your password has been reset successfully. Please sign in with your new password.",
        [
          {
            text: "Sign In",
            onPress: () => router.replace("/auth/signin"),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Reset Failed", err.message || "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      await resetPassword(email);
      setResendCooldown(60);
      Alert.alert("Code Sent", "A new reset code has been sent to your email");
    } catch (err: any) {
      Alert.alert("Failed to Resend", err.message || "Please try again");
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
            <Ionicons name="key-outline" size={64} color="#10B981" />
          </View>

          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the code sent to{"\n"}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Code Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit ? styles.codeInputFilled : null,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(index, value)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handleKeyPress(index, key)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              {validationErrors.code ? (
                <Text style={styles.errorText}>{validationErrors.code}</Text>
              ) : null}

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={resendCooldown > 0}>
                  <Text
                    style={[
                      styles.resendLink,
                      resendCooldown > 0 && styles.resendLinkDisabled,
                    ]}>
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    setValidationErrors((prev) => ({
                      ...prev,
                      newPassword: "",
                    }));
                  }}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}>
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.newPassword ? (
                <Text style={styles.errorText}>
                  {validationErrors.newPassword}
                </Text>
              ) : null}

              {/* Password Strength */}
              {newPassword.length > 0 && (
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
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setValidationErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleResetPassword}
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

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
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
  email: {
    fontWeight: "600",
    color: "#10B981",
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
  codeContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#1f2937",
  },
  codeInputFilled: {
    borderColor: "#10B981",
    backgroundColor: "#d1fae5",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  resendLink: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  resendLinkDisabled: {
    color: "#9ca3af",
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
  resetButton: {
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
  resetButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
});
