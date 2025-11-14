import { storageService } from "@/services/storageService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const entryId = params.entryId as string;

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<any>(null);

  useEffect(() => {
    if (entryId) {
      loadEntry();
    }
  }, [entryId]);

  const loadEntry = async () => {
    try {
      const entries = await storageService.getFoodEntries();
      const foundEntry = entries.find((e) => e.id === entryId);
      setEntry(foundEntry);
    } catch (error) {
      Alert.alert("Error", "Failed to load food entry");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.push("/(tabs)/history");
  };

  const goHome = () => {
    router.push("/(tabs)/index");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading results...</Text>
          <Text style={styles.loadingSubtext}>
            Getting your nutrition analysis
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Entry not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={goHome}>
            <Text style={styles.retryButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { analysis, imageUri } = entry;
  const { totalCalories, macronutrients, foodItems } = analysis;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Header with Success Icon */}
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#ffffff" />
          </View>
          <Text style={styles.title}>Analysis Complete!</Text>
          <Text style={styles.subtitle}>
            Your meal has been logged successfully
          </Text>
        </View>

        {/* Food Image */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        {/* Nutrition Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.caloriesContainer}>
            <Text style={styles.caloriesLabel}>Total Calories</Text>
            <Text style={styles.caloriesValue}>{totalCalories}</Text>
            <Text style={styles.caloriesUnit}>kcal</Text>
          </View>

          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>
                {Math.round(macronutrients.protein)}g
              </Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>
                {Math.round(macronutrients.carbs)}g
              </Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>
                {Math.round(macronutrients.fat)}g
              </Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>
                {Math.round(macronutrients.fiber)}g
              </Text>
              <Text style={styles.macroLabel}>Fiber</Text>
            </View>
          </View>
        </View>

        {/* Food Items Breakdown */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Food Items</Text>

          {foodItems.map((item: any, index: number) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCalories}>{item.calories} kcal</Text>
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemQuantity}>
                  {item.portion?.amount || item.weight}{" "}
                  {item.portion?.unit || item.unit}
                </Text>
                <Text style={styles.itemConfidence}>
                  {item.confidence}% confidence
                </Text>
              </View>

              <View style={styles.itemMacros}>
                <View style={styles.itemMacro}>
                  <Text style={styles.itemMacroLabel}>Protein</Text>
                  <Text style={styles.itemMacroValue}>
                    {Math.round(item.macronutrients.protein)}g
                  </Text>
                </View>
                <View style={styles.itemMacro}>
                  <Text style={styles.itemMacroLabel}>Carbs</Text>
                  <Text style={styles.itemMacroValue}>
                    {Math.round(item.macronutrients.carbs)}g
                  </Text>
                </View>
                <View style={styles.itemMacro}>
                  <Text style={styles.itemMacroLabel}>Fat</Text>
                  <Text style={styles.itemMacroValue}>
                    {Math.round(item.macronutrients.fat)}g
                  </Text>
                </View>
                <View style={styles.itemMacro}>
                  <Text style={styles.itemMacroLabel}>Fiber</Text>
                  <Text style={styles.itemMacroValue}>
                    {Math.round(item.macronutrients.fiber)}g
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Confidence Badge */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBadge}>
            <Ionicons name="analytics" size={20} color="#10B981" />
            <Text style={styles.confidenceText}>
              Analysis Confidence: {analysis.confidence}%
            </Text>
          </View>
          <Text style={styles.confidenceNote}>
            Higher confidence means more accurate nutrition estimates
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
          <Ionicons name="home" size={20} color="#10B981" />
          <Text style={styles.secondaryButtonText}>Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Ionicons name="time" size={20} color="white" />
          <Text style={styles.finishButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: 200,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  caloriesContainer: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 24,
  },
  caloriesLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#10B981",
  },
  caloriesUnit: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  itemsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  itemCalories: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemConfidence: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemMacros: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  itemMacro: {
    alignItems: "center",
  },
  itemMacroLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  itemMacroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  confidenceContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  confidenceNote: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "white",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 8,
  },
  finishButton: {
    flex: 1,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
});
