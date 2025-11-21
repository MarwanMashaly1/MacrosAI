import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Service imports

// Direct camera imports
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";

// Type definitions
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  weight: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
}

export default function CameraTab() {
  const params = useLocalSearchParams<{ pastEntryTimestamp?: string }>();
  const pastEntryTimestamp = params.pastEntryTimestamp
    ? parseInt(params.pastEntryTimestamp)
    : null;

  // State variables
  const [facing, setFacing] = useState<CameraType>("back");
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Optimized takePicture - no base64 conversion during capture for instant response
  const takePicture = async () => {
    if (analyzing || !cameraRef.current) return;

    try {
      // Show loading immediately
      setAnalyzing(true);

      // Take photo WITHOUT base64 (much faster - no UI hang)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6, // Reduced quality for faster processing and smaller file
        base64: false, // Don't generate base64 here - it blocks UI
      });

      // Close camera immediately for better UX
      setShowCamera(false);

      // Navigate with just the URI - base64 conversion happens in identify screen
      router.push({
        pathname: "/identify",
        params: {
          imageUri: photo.uri,
          // Pass the past entry timestamp if it exists
          pastEntryTimestamp: pastEntryTimestamp?.toString() || "",
        },
      });

      // Reset state
      setCapturedImage(null);
      setAnalyzing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to take picture. Please try again.");
      console.error("Camera error:", error);
      setShowCamera(false);
      setAnalyzing(false);
    }
  };

  const pickImage = async () => {
    if (analyzing) return;
    try {
      setAnalyzing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6, // Reduced for faster processing
        base64: false, // Skip base64 conversion for instant response
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        router.push({
          pathname: "/identify",
          params: {
            imageUri: asset.uri,
            // Pass the past entry timestamp if it exists
            pastEntryTimestamp: pastEntryTimestamp?.toString() || "",
          },
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error("Image picker error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCameraFacing = useCallback(
    () => setFacing((current) => (current === "back" ? "front" : "back")),
    []
  );
  const handleCloseCamera = useCallback(() => setShowCamera(false), []);
  const handleOpenCamera = useCallback(() => setShowCamera(true), []);

  if (Platform.OS !== "web" && !permission) {
    return <View style={styles.container} />;
  }

  if (Platform.OS !== "web" && !permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={64} color="#d1d5db" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need your camera to analyze food photos.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCamera && Platform.OS !== "web") {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
          mode="picture"
        />
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCloseCamera}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={analyzing}>
            {analyzing ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="restaurant" size={32} color="#10B981" />
          <Text style={styles.title}>Food Analysis</Text>
          <Text style={styles.subtitle}>
            Capture or select a photo for nutrition info
          </Text>
        </View>

        {analyzing ? (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.analyzingText}>Processing image...</Text>
            <Text style={styles.analyzingSubtext}>
              Getting ready for analysis
            </Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                analyzing && styles.actionButtonDisabled,
              ]}
              onPress={handleOpenCamera}
              disabled={analyzing}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.secondaryButton,
                analyzing && styles.secondaryButtonDisabled,
              ]}
              onPress={pickImage}
              disabled={analyzing}>
              <Ionicons name="image" size={24} color="#10B981" />
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!analyzing && (
          <>
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What we can analyze:</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="flash" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Calories & Macros</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="scale" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Portion Sizes</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="restaurant" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Food Identification</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="barbell" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Nutritional Breakdown</Text>
                </View>
              </View>
            </View>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>📸 Tips for better results:</Text>
              <Text style={styles.tipText}>• Use good, direct lighting</Text>
              <Text style={styles.tipText}>
                • Capture the entire meal in the frame
              </Text>
              <Text style={styles.tipText}>• Avoid blurry photos</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Base & Layout Styles
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },

  // Action Button Styles
  actionButtons: { gap: 16, marginBottom: 40 },
  actionButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  secondaryButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  secondaryButtonText: { color: "#10B981" },

  // Analyzing Indicator Styles
  analyzingContainer: { alignItems: "center", padding: 40 },
  analyzingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },

  // Camera UI Styles
  cameraContainer: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  cameraControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10B981",
  },

  // Permission Screen Styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },

  // Added UI Element Styles
  featuresContainer: { marginBottom: 40 },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  featuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  featureText: { fontSize: 16, color: "#1f2937", marginLeft: 8 },
  tipsContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 12,
  },
  tipText: { fontSize: 14, color: "#065f46", lineHeight: 22, marginBottom: 8 },
});
