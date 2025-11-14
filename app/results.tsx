import { FoodEntry, storageService } from "@/services/storageService";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    imageUri?: string;
    analysisResult?: string;
    entryId?: string;
    pastEntryTimestamp?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [entry, setEntry] = useState<any>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [entryNotes, setEntryNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Check if this is an existing entry (from history)
      if (params.entryId) {
        await loadExistingEntry(params.entryId);
        setIsNewEntry(false);
      }
      // Check if this is a new entry (from identify screen)
      else if (params.analysisResult) {
        loadNewEntry();
        setIsNewEntry(true);
      } else {
        Alert.alert("Error", "No entry data found");
        router.back();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load entry data");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadExistingEntry = async (entryId: string) => {
    const entries = await storageService.getFoodEntries();
    const foundEntry = entries.find((e) => e.id === entryId);

    if (!foundEntry) {
      throw new Error("Entry not found");
    }

    setEntry(foundEntry);
    setSelectedMealType(foundEntry.mealType || "lunch");
    setEntryNotes(foundEntry.notes || "");
  };

  const loadNewEntry = () => {
    try {
      const analysisResult = JSON.parse(params.analysisResult!);

      // Create entry object from analysis result
      const newEntry = {
        imageUri: params.imageUri,
        analysis: {
          totalCalories: analysisResult.totalCalories,
          confidence: analysisResult.confidence,
          foodItems: analysisResult.foodItems,
          macronutrients: analysisResult.macronutrients || {
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
          },
          nutritionSummary: analysisResult.nutritionSummary || {
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
          },
        },
        isManual: false,
      };

      setEntry(newEntry);

      // Auto-select meal type based on time of day
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) {
        setSelectedMealType("breakfast");
      } else if (hour >= 11 && hour < 15) {
        setSelectedMealType("lunch");
      } else if (hour >= 15 && hour < 21) {
        setSelectedMealType("dinner");
      } else {
        setSelectedMealType("snack");
      }
    } catch (error) {
      console.error("Error parsing analysis result:", error);
      throw error;
    }
  };

  const handleSaveEntry = async () => {
    if (!entry) return;

    try {
      setIsSaving(true);

      const timestamp = params.pastEntryTimestamp
        ? parseInt(params.pastEntryTimestamp)
        : Date.now();

      const entryData: Omit<FoodEntry, "id"> = {
        timestamp,
        imageUri: entry.imageUri || "",
        analysis: {
          totalCalories: entry.analysis.totalCalories,
          confidence: entry.analysis.confidence,
          foodItems: entry.analysis.foodItems,
          macronutrients: entry.analysis.macronutrients,
          nutritionSummary: entry.analysis.nutritionSummary,
        },
        mealType: selectedMealType,
        notes: entryNotes.trim() || undefined,
        isManual: entry.isManual || false,
      };

      await storageService.saveFoodEntry(entryData);

      Alert.alert("Success", "Food entry saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)/history");
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving entry:", error);
      Alert.alert("Error", "Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    if (isNewEntry) {
      // Save the entry first
      handleSaveEntry();
    } else {
      // Just navigate to history
      router.replace("/(tabs)/history");
    }
  };

  const goHome = () => {
    router.replace("/(tabs)"); // Change from "/(tabs)/index" to "/(tabs)"
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

  const { analysis, imageUri, isManual } = entry;
  const { totalCalories, foodItems } = analysis;
  const macronutrients = analysis.macronutrients ||
    analysis.nutritionSummary || {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Success Icon */}
      <View style={styles.header}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>
          {isNewEntry ? "Analysis Complete!" : "Entry Details"}
        </Text>
        <Text style={styles.subtitle}>
          {isNewEntry
            ? "Review and save your meal"
            : "Your saved nutrition information"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Manual Entry Badge */}
        {isManual && (
          <View style={styles.manualBadge}>
            <Ionicons name="create" size={16} color="#10B981" />
            <Text style={styles.manualBadgeText}>Manual Entry</Text>
          </View>
        )}

        {/* Food Image */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        {/* Meal Type Selection (only for new entries) */}
        {isNewEntry && (
          <View style={styles.mealTypeSection}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeButtons}>
              {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      selectedMealType === type && styles.mealTypeButtonActive,
                    ]}
                    onPress={() => setSelectedMealType(type)}>
                    <Text
                      style={[
                        styles.mealTypeButtonText,
                        selectedMealType === type &&
                          styles.mealTypeButtonTextActive,
                      ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
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
          <Text style={styles.sectionTitle}>
            Food Items ({foodItems?.length || 0})
          </Text>

          {foodItems?.map((item: any, index: number) => (
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

              {item.macronutrients && (
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
              )}
            </View>
          ))}
        </View>

        {/* Notes Section (only for new entries) */}
        {isNewEntry && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about this meal..."
              value={entryNotes}
              onChangeText={setEntryNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        {/* Display notes for existing entries */}
        {!isNewEntry && entry.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesDisplay}>
              <Text style={styles.notesDisplayText}>{entry.notes}</Text>
            </View>
          </View>
        )}

        {/* Confidence Badge */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBadge}>
            <Ionicons name="analytics" size={20} color="#10B981" />
            <Text style={styles.confidenceText}>
              Analysis Confidence: {analysis.confidence}%
            </Text>
          </View>
          <Text style={styles.confidenceNote}>
            {analysis.confidence >= 90
              ? "High confidence - very accurate estimates"
              : analysis.confidence >= 70
              ? "Good confidence - reliable estimates"
              : "Moderate confidence - estimates may vary"}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={goHome}
          disabled={isSaving}>
          <Ionicons name="home" size={20} color="#10B981" />
          <Text style={styles.secondaryButtonText}>Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton, isSaving && styles.finishButtonDisabled]}
          onPress={handleFinish}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name={isNewEntry ? "checkmark" : "time"}
                size={20}
                color="white"
              />
              <Text style={styles.finishButtonText}>
                {isNewEntry ? "Save Entry" : "View History"}
              </Text>
            </>
          )}
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
  content: {
    padding: 20,
    paddingBottom: 40,
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
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  manualBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B98115",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
    gap: 6,
  },
  manualBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
  },
  mealTypeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  mealTypeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  mealTypeButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  mealTypeButtonTextActive: {
    color: "#ffffff",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
    marginBottom: 20,
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
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 100,
    textAlignVertical: "top",
  },
  notesDisplay: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  notesDisplayText: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 24,
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
    gap: 8,
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
