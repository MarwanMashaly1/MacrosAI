import { storageService } from "@/services/storageService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodItemInput {
  id: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  weight: string;
}

export default function AddEntryManualScreen() {
  const params = useLocalSearchParams<{ timestamp: string }>();
  const timestamp = parseInt(params.timestamp);

  const [mealType, setMealType] = useState<MealType>("lunch");
  const [foodItems, setFoodItems] = useState<FoodItemInput[]>([
    {
      id: "1",
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fiber: "",
      weight: "",
    },
  ]);
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddFoodItem = () => {
    setFoodItems([
      ...foodItems,
      {
        id: Date.now().toString(),
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        weight: "",
      },
    ]);
  };

  const handleRemoveFoodItem = (id: string) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((item) => item.id !== id));
    }
  };

  const handleUpdateFoodItem = (
    id: string,
    field: keyof FoodItemInput,
    value: string
  ) => {
    setFoodItems(
      foodItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const validateForm = (): boolean => {
    // Check if at least one food item has a name and calories
    const hasValidItem = foodItems.some(
      (item) => item.name.trim() !== "" && item.calories.trim() !== ""
    );

    if (!hasValidItem) {
      Alert.alert(
        "Invalid Input",
        "Please add at least one food item with a name and calorie value"
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      // Convert food items to proper format
      const processedFoodItems = foodItems
        .filter(
          (item) => item.name.trim() !== "" && item.calories.trim() !== ""
        )
        .map((item) => {
          const weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
          return {
            id: Math.random().toString(36).substring(2, 11),
            name: item.name,
            calories: parseFloat(item.calories) || 0,
            weight: weightMatch ? parseFloat(weightMatch[1]) : 0,
            unit: weightMatch ? (weightMatch[2] || "g") : "g",
            nutrients: {
              protein: parseFloat(item.protein) || 0,
              carbs: parseFloat(item.carbs) || 0,
              fat: parseFloat(item.fat) || 0,
              fiber: parseFloat(item.fiber) || 0,
            },
            confidence: 100,
            portion: {
              amount: 1,
              unit: "serving",
            },
          };
        });

      // Calculate totals
      const totalCalories = processedFoodItems.reduce(
        (sum, item) => sum + item.calories,
        0
      );
      const totalProtein = processedFoodItems.reduce(
        (sum, item) => sum + (item.nutrients?.protein || 0),
        0
      );
      const totalCarbs = processedFoodItems.reduce(
        (sum, item) => sum + (item.nutrients?.carbs || 0),
        0
      );
      const totalFat = processedFoodItems.reduce(
        (sum, item) => sum + (item.nutrients?.fat || 0),
        0
      );
      const totalFiber = processedFoodItems.reduce(
        (sum, item) => sum + (item.nutrients?.fiber || 0),
        0
      );

      const entry = {
        timestamp,
        imageUri: imageUri || "",
        analysis: {
          totalCalories,
          confidence: 100,
          foodItems: processedFoodItems,
          nutritionSummary: {
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
            fiber: totalFiber,
          },
        },
        mealType,
        notes: notes.trim() || undefined,
        isManual: true,
      };

      await storageService.saveManualFoodEntry(entry);

      Alert.alert("Success", "Manual entry added successfully", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)/history");
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving manual entry:", error);
      Alert.alert("Error", "Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manual Entry</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}>
            <Text
              style={[
                styles.saveButtonText,
                isSaving && styles.saveButtonTextDisabled,
              ]}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Meal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      mealType === type && styles.mealTypeButtonActive,
                    ]}
                    onPress={() => setMealType(type)}>
                    <Text
                      style={[
                        styles.mealTypeButtonText,
                        mealType === type && styles.mealTypeButtonTextActive,
                      ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Optional Image */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photo (Optional)</Text>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickImage}>
                <Ionicons name="image" size={32} color="#10B981" />
                <Text style={styles.addImageButtonText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Food Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Food Items</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={handleAddFoodItem}>
                <Ionicons name="add-circle" size={24} color="#10B981" />
                <Text style={styles.addItemButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {foodItems.map((item, index) => (
              <View key={item.id} style={styles.foodItemCard}>
                <View style={styles.foodItemHeader}>
                  <Text style={styles.foodItemNumber}>Item {index + 1}</Text>
                  {foodItems.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveFoodItem(item.id)}>
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Food name *"
                  value={item.name}
                  onChangeText={(value) =>
                    handleUpdateFoodItem(item.id, "name", value)
                  }
                  placeholderTextColor="#9ca3af"
                />

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Calories *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      value={item.calories}
                      onChangeText={(value) =>
                        handleUpdateFoodItem(item.id, "calories", value)
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Weight</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="100g"
                      value={item.weight}
                      onChangeText={(value) =>
                        handleUpdateFoodItem(item.id, "weight", value)
                      }
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                <Text style={styles.macrosLabel}>
                  Macronutrients (Optional)
                </Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputQuarter}>
                    <Text style={styles.inputLabel}>Protein (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      value={item.protein}
                      onChangeText={(value) =>
                        handleUpdateFoodItem(item.id, "protein", value)
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={styles.inputQuarter}>
                    <Text style={styles.inputLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      value={item.carbs}
                      onChangeText={(value) =>
                        handleUpdateFoodItem(item.id, "carbs", value)
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputQuarter}>
                    <Text style={styles.inputLabel}>Fat (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      value={item.fat}
                      onChangeText={(value) =>
                        handleUpdateFoodItem(item.id, "fat", value)
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={styles.inputQuarter}>
                    <Text style={styles.inputLabel}>Fiber (g)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      value={item.fiber}
                      onChangeText={(value) =>
                        handleUpdateFoodItem(item.id, "fiber", value)
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any notes about this meal..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.helperText}>
            <Ionicons name="information-circle" size={16} color="#6b7280" />
            <Text style={styles.helperTextContent}>
              Fields marked with * are required
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  saveButtonTextDisabled: {
    color: "#9ca3af",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealTypeContainer: {
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
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  addImageButton: {
    aspectRatio: 4 / 3,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addImageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addItemButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  foodItemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  foodItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  foodItemNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputQuarter: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  macrosLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 4,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  helperText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    marginTop: 8,
  },
  helperTextContent: {
    fontSize: 14,
    color: "#065f46",
  },
});
