import {
  DailyGoals,
  storageService,
  UserProfile,
} from "@/services/storageService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25,
  });
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const profile = await storageService.getUserProfile();
      const goals = await storageService.getDailyGoals();
      const savedApiKey = await storageService.getGeminiApiKey();

      if (profile) {
        setUserProfile(profile);
      }
      if (goals) {
        setDailyGoals(goals);
      }
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveUserProfile = async () => {
    if (!userProfile) return;

    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        updatedAt: Date.now(),
      };
      await storageService.saveUserProfile(updatedProfile);
      Alert.alert("Success", "Profile saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const saveDailyGoals = async () => {
    setIsLoading(true);
    try {
      await storageService.saveDailyGoals(dailyGoals);
      Alert.alert("Success", "Daily goals saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save daily goals");
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter a valid API key");
      return;
    }

    setIsLoading(true);
    try {
      await storageService.saveGeminiApiKey(apiKey.trim());
      Alert.alert("Success", "API key saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your food entries, profile, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await storageService.clearAllData();
              setUserProfile(null);
              setApiKey("");
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  const createDefaultProfile = () => {
    const newProfile: UserProfile = {
      name: "",
      age: undefined,
      weight: undefined,
      height: undefined,
      activityLevel: "moderate",
      dailyCalorieGoal: 2000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setUserProfile(newProfile);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your food tracking experience
          </Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>User Profile</Text>
          </View>

          {userProfile ? (
            <View style={styles.profileForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={userProfile.name}
                  onChangeText={(text) =>
                    setUserProfile({ ...userProfile, name: text })
                  }
                  placeholder="Enter your name"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userProfile.age?.toString() || ""}
                    onChangeText={(text) =>
                      setUserProfile({
                        ...userProfile,
                        age: text ? parseInt(text) : undefined,
                      })
                    }
                    placeholder="Age"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userProfile.weight?.toString() || ""}
                    onChangeText={(text) =>
                      setUserProfile({
                        ...userProfile,
                        weight: text ? parseFloat(text) : undefined,
                      })
                    }
                    placeholder="Weight"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={userProfile.height?.toString() || ""}
                  onChangeText={(text) =>
                    setUserProfile({
                      ...userProfile,
                      height: text ? parseFloat(text) : undefined,
                    })
                  }
                  placeholder="Height in centimeters"
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveUserProfile}>
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  style={styles.saveButtonGradient}>
                  <Ionicons name="save" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.createProfileButton}
              onPress={createDefaultProfile}>
              <Text style={styles.createProfileText}>Create Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#10B981" />
            </TouchableOpacity>
          )}
        </View>

        {/* Daily Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="target" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Daily Goals</Text>
          </View>

          <View style={styles.goalsForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Calories</Text>
              <TextInput
                style={styles.textInput}
                value={dailyGoals.calories.toString()}
                onChangeText={(text) =>
                  setDailyGoals({
                    ...dailyGoals,
                    calories: parseInt(text) || 0,
                  })
                }
                placeholder="2000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.textInput}
                  value={dailyGoals.protein.toString()}
                  onChangeText={(text) =>
                    setDailyGoals({
                      ...dailyGoals,
                      protein: parseInt(text) || 0,
                    })
                  }
                  placeholder="150"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.textInput}
                  value={dailyGoals.carbs.toString()}
                  onChangeText={(text) =>
                    setDailyGoals({
                      ...dailyGoals,
                      carbs: parseInt(text) || 0,
                    })
                  }
                  placeholder="250"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.textInput}
                  value={dailyGoals.fat.toString()}
                  onChangeText={(text) =>
                    setDailyGoals({
                      ...dailyGoals,
                      fat: parseInt(text) || 0,
                    })
                  }
                  placeholder="65"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Fiber (g)</Text>
                <TextInput
                  style={styles.textInput}
                  value={dailyGoals.fiber.toString()}
                  onChangeText={(text) =>
                    setDailyGoals({
                      ...dailyGoals,
                      fiber: parseInt(text) || 0,
                    })
                  }
                  placeholder="25"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveDailyGoals}>
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                style={styles.saveButtonGradient}>
                <Ionicons name="save" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Goals</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* API Configuration Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key" size={24} color="#F97316" />
            <Text style={styles.sectionTitle}>API Configuration</Text>
          </View>

          <View style={styles.apiForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gemini API Key</Text>
              <View style={styles.apiKeyContainer}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Enter your Gemini API key"
                  secureTextEntry={!showApiKey}
                />
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => setShowApiKey(!showApiKey)}>
                  <Text style={styles.toggleButtonText}>
                    {showApiKey ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
              <LinearGradient
                colors={["#F97316", "#EA580C"]}
                style={styles.saveButtonGradient}>
                <Ionicons name="save" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save API Key</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#6B7280" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.aboutContent}>
            <Text style={styles.aboutText}>MacrosAI Food Log App v1.0.0</Text>
            <Text style={styles.aboutDescription}>
              AI-powered food tracking application using Google Gemini for
              accurate nutrition analysis.
            </Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trash" size={24} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>
              Danger Zone
            </Text>
          </View>

          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 12,
  },
  profileForm: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  createProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  createProfileText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  goalsForm: {
    gap: 16,
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  apiForm: {
    gap: 16,
  },
  apiKeyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  aboutContent: {
    alignItems: "center",
  },
  aboutText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  dangerSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  dangerButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
});
