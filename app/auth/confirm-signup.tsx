import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmSignUpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { confirmSignUp, resendSignUpCode, isLoading } = useAuth();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Handle code input change
  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every((digit) => digit !== "") && !isVerifying) {
      handleVerify(newCode.join(""));
    }
  };

  // Handle backspace
  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify code
  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");

    if (codeToVerify.length !== 6) {
      Alert.alert("Invalid Code", "Please enter all 6 digits");
      return;
    }

    try {
      setIsVerifying(true);
      await confirmSignUp(email, codeToVerify);

      Alert.alert(
        "Success! 🎉",
        "Your email has been verified. Please sign in to continue.",
        [
          {
            text: "Sign In",
            onPress: () => router.replace("/auth/signin"),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Verification Failed", err.message || "Please try again");
      // Clear code inputs on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendSignUpCode(email);
      setResendCooldown(60); // 60 second cooldown
      Alert.alert(
        "Code Sent",
        "A new verification code has been sent to your email"
      );
    } catch (err: any) {
      Alert.alert("Failed to Resend", err.message || "Please try again");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1f2937" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={64} color="#10B981" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
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

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (isVerifying || isLoading) && styles.buttonDisabled,
          ]}
          onPress={() => handleVerify()}
          disabled={isVerifying || isLoading}
          activeOpacity={0.8}>
          {isVerifying || isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.verifyButtonText}>Verify Email</Text>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

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

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#6b7280"
          />
          <Text style={styles.helpText}>
            Check your spam folder if you don't see the email
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 40,
    lineHeight: 24,
  },
  email: {
    fontWeight: "600",
    color: "#10B981",
  },
  codeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 50,
    height: 60,
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
  verifyButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: "#6b7280",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  resendLinkDisabled: {
    color: "#9ca3af",
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
  },
});
