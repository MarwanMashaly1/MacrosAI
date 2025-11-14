import { geminiService, IdentifiedItem } from "@/services/geminiService";
import { FoodItem, storageService } from "@/services/storageService";
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

export default function IdentifyScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const base64 = params.base64 as string;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<IdentifiedItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (base64) {
      identifyFood();
    }
  }, [base64]);

  const identifyFood = async () => {
    setLoading(true);
    try {
      const result = await geminiService.identifyFood(base64);
      setItems(result.items);
    } catch (error) {
      Alert.alert("Error", "Failed to identify food items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Type-specific update functions for IdentifiedItem properties
  const updateItemText = (
    index: number,
    field: "name" | "estimated_size" | "quantity", // Added quantity here since it's now a string
    value: string
  ) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const updateItemNumber = (
    index: number,
    field: "confidence", // Removed quantity since it's now a string
    value: number
  ) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const adjustQuantity = (index: number, delta: number) => {
    const currentItem = items[index];
    if (!currentItem) return;

    // Parse the current quantity string (e.g., "2 pieces" -> 2)
    const currentQuantityMatch = currentItem.quantity
      .toString()
      .match(/^\d+(\.\d+)?/);
    const currentQuantity = currentQuantityMatch
      ? parseFloat(currentQuantityMatch[0])
      : 1;
    const unit =
      currentItem.quantity.toString().replace(/^\d+(\.\d+)?\s*/, "") ||
      "serving";

    const newQuantity = Math.max(0.1, currentQuantity + delta);
    const newQuantityString = `${newQuantity.toFixed(1)} ${unit}`;

    // Use updateItemText since quantity is now a string
    updateItemText(index, "quantity", newQuantityString);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addNewItem = () => {
    const newItem: IdentifiedItem = {
      name: "New Food Item",
      quantity: "1 serving",
      estimated_size: "medium",
      confidence: 50,
    };
    setItems([...items, newItem]);
    setEditingId(items.length); // Start editing the new item
  };

  // Helper function to safely get numeric value
  const safeNumber = (value: number | undefined | null): number => {
    return typeof value === "number" && !isNaN(value) ? value : 0;
  };

  // Convert IdentifiedItem to the format expected by calculateNutrition
  const convertToNutritionItems = (identifiedItems: IdentifiedItem[]) => {
    return identifiedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      estimated_size: item.estimated_size,
    }));
  };

  const proceedToResults = async () => {
    if (items.length === 0) {
      Alert.alert("No Items", "Please add at least one food item to continue.");
      return;
    }

    try {
      // Convert IdentifiedItems to the format needed for nutrition calculation
      const nutritionItems = convertToNutritionItems(items);

      // Calculate nutrition using the gemini service
      const nutritionAnalysis = await geminiService.calculateNutrition(
        nutritionItems
      );

      // Create FoodItems from the nutrition analysis
      const foodItems: FoodItem[] = nutritionAnalysis.foodItems.map((item) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        calories: item.calories,
        weight: parseFloat(item.weight.replace(/\D/g, "")) || 100, // Extract number from weight string
        unit: item.weight.replace(/[\d.]/g, "").trim() || "g", // Extract unit from weight string
        macronutrients: {
          protein: item.nutrients?.protein || 0,
          carbs: item.nutrients?.carbs || 0,
          fat: item.nutrients?.fat || 0,
          fiber: item.nutrients?.fiber || 0,
        },
        confidence: item.confidence,
        portion: {
          amount: parseFloat(
            nutritionItems.find((ni) => ni.name === item.name)?.quantity || "1"
          ),
          unit:
            nutritionItems
              .find((ni) => ni.name === item.name)
              ?.quantity.replace(/[\d.]/g, "")
              .trim() || "serving",
        },
      }));

      // Save the food entry - now returns the saved entry with ID
      const foodEntry = await storageService.saveFoodEntry({
        imageUri,
        analysis: {
          foodItems: foodItems,
          totalCalories: nutritionAnalysis.totalCalories,
          confidence: nutritionAnalysis.confidence,
          macronutrients: nutritionAnalysis.nutritionSummary,
        },
        timestamp: Date.now(),
        mealType: undefined,
        notes: undefined,
      });

      router.push({
        pathname: "/results",
        params: {
          entryId: foodEntry.id,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze nutrition information");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Analyzing your food...</Text>
          <Text style={styles.loadingSubtext}>
            Using AI to identify ingredients and calculate nutrition
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Food Identified</Text>
            <Text style={styles.headerSubtitle}>
              Review and adjust the items and quantities below
            </Text>
          </View>

          {/* Food Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.foodImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageLabel}>Your Meal</Text>
            </View>
          </View>

          {/* Identified Items */}
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsTitle}>
              Identified Items ({items.length})
            </Text>
            {items.map((item, index) => {
              // Parse quantity for display
              const quantityMatch = item.quantity
                .toString()
                .match(/^\d+(\.\d+)?/);
              const quantity = quantityMatch ? parseFloat(quantityMatch[0]) : 1;
              const unit =
                item.quantity.toString().replace(/^\d+(\.\d+)?\s*/, "") ||
                "serving";

              return (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemName}>
                        {item.name || "Unknown Food"}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeItem(index)}>
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemSize}>
                      Size: {item.estimated_size}
                    </Text>
                  </View>

                  <View style={styles.itemControls}>
                    <View style={styles.quantitySection}>
                      <Text style={styles.quantityLabel}>Quantity:</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => adjustQuantity(index, -0.1)}>
                          <Ionicons name="remove" size={16} color="#6b7280" />
                        </TouchableOpacity>
                        <View style={styles.quantityDisplay}>
                          <Text style={styles.quantityText}>
                            {quantity.toFixed(1)}
                          </Text>
                          <Text style={styles.unitText}>{unit}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => adjustQuantity(index, 0.1)}>
                          <Ionicons name="add" size={16} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {editingId === index ? (
                      <View style={styles.editingControls}>
                        <TextInput
                          style={styles.editInput}
                          value={item.name || ""}
                          onChangeText={(text) =>
                            updateItemText(index, "name", text)
                          }
                          onBlur={() => setEditingId(null)}
                          autoFocus
                          placeholder="Food name"
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setEditingId(index)}>
                        <Ionicons name="pencil" size={16} color="#10B981" />
                        <Text style={styles.editButtonText}>Edit name</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Confidence Badge */}
                  <View style={styles.confidenceContainer}>
                    <Ionicons name="analytics" size={16} color="#10B981" />
                    <Text style={styles.confidenceText}>
                      {item.confidence}% confidence
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add Item Button */}
          <View style={styles.addItemContainer}>
            <TouchableOpacity style={styles.addItemButton} onPress={addNewItem}>
              <Ionicons name="add-circle" size={24} color="#10B981" />
              <Text style={styles.addItemText}>Add missing item</Text>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Ready to analyze?</Text>
            <Text style={styles.summaryText}>
              We've identified {items.length} food item
              {items.length !== 1 ? "s" : ""} in your meal. Review the items and
              quantities above, then continue to see detailed nutrition
              information.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => router.back()}>
              <Ionicons name="camera" size={20} color="#10B981" />
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={proceedToResults}
              disabled={items.length === 0}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  foodImage: {
    width: "100%",
    height: 200,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
  },
  imageLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemsTitle: {
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 16,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  itemSize: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  removeButton: {
    padding: 4,
  },
  itemControls: {
    marginBottom: 12,
  },
  quantitySection: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quantityDisplay: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  unitText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  editingControls: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  editButtonText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  confidenceText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  addItemContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#10B981",
    borderStyle: "dashed",
  },
  addItemText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 8,
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  summaryText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  retakeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 8,
  },
  continueButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
});
