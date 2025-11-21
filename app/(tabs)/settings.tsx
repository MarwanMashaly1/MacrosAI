import { useAuth } from "@/context/AuthContext";
import {
  DailyGoals,
  storageService,
  UserProfile,
} from "@/services/storageService";
import { Ionicons } from "@expo/vector-icons";
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
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 30,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [tempGoals, setTempGoals] = useState<DailyGoals>({ ...dailyGoals });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const profile = await storageService.getUserProfile();
      const goals = await storageService.getDailyGoals();

      if (profile) {
        setUserProfile(profile);
        setTempProfile(profile);
      } else {
        createDefaultProfile();
      }

      if (goals) {
        setDailyGoals(goals);
        setTempGoals(goals);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const createDefaultProfile = () => {
    const newProfile: UserProfile = {
      name: "",
      height: 0,
      weight: 0,
      age: 0,
      gender: "male",
      activityLevel: "moderate",
      goal: "maintain",
    };
    setUserProfile(newProfile);
    setTempProfile(newProfile);
  };

  const handleSignOut = async () => {
    await logout();
  };

  const saveProfile = async () => {
    if (!tempProfile) return;
    try {
      await storageService.saveUserProfile(tempProfile);
      setUserProfile(tempProfile);
      setIsEditingProfile(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  const saveGoals = async () => {
    try {
      await storageService.saveDailyGoals(tempGoals);
      setDailyGoals(tempGoals);
      setIsEditingGoals(false);
      Alert.alert("Success", "Daily goals updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save goals");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your food entries and settings? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await storageService.clearAllData();
            loadSettings(); // Reload defaults
            Alert.alert("Success", "All data has been cleared");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditingProfile) saveProfile();
                else setIsEditingProfile(true);
              }}>
              <Text style={styles.editButton}>
                {isEditingProfile ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {tempProfile && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                {isEditingProfile ? (
                  <TextInput
                    style={styles.input}
                    value={tempProfile.name}
                    onChangeText={(text) =>
                      setTempProfile({ ...tempProfile, name: text })
                    }
                    placeholder="Your Name"
                  />
                ) : (
                  <Text style={styles.value}>
                    {userProfile?.name || "Not set"}
                  </Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  {isEditingProfile ? (
                    <TextInput
                      style={styles.input}
                      value={tempProfile.height.toString()}
                      onChangeText={(text) =>
                        setTempProfile({
                          ...tempProfile,
                          height: parseInt(text) || 0,
                        })
                      }
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.value}>{userProfile?.height} cm</Text>
                  )}
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  {isEditingProfile ? (
                    <TextInput
                      style={styles.input}
                      value={tempProfile.weight.toString()}
                      onChangeText={(text) =>
                        setTempProfile({
                          ...tempProfile,
                          weight: parseInt(text) || 0,
                        })
                      }
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.value}>{userProfile?.weight} kg</Text>
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Age</Text>
                  {isEditingProfile ? (
                    <TextInput
                      style={styles.input}
                      value={tempProfile.age.toString()}
                      onChangeText={(text) =>
                        setTempProfile({
                          ...tempProfile,
                          age: parseInt(text) || 0,
                        })
                      }
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.value}>{userProfile?.age}</Text>
                  )}
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Gender</Text>
                  {isEditingProfile ? (
                    <View style={styles.pickerContainer}>
                      <TouchableOpacity
                        style={[
                          styles.pickerOption,
                          tempProfile.gender === "male" &&
                            styles.pickerSelected,
                        ]}
                        onPress={() =>
                          setTempProfile({ ...tempProfile, gender: "male" })
                        }>
                        <Text
                          style={[
                            styles.pickerText,
                            tempProfile.gender === "male" &&
                              styles.pickerTextSelected,
                          ]}>
                          M
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.pickerOption,
                          tempProfile.gender === "female" &&
                            styles.pickerSelected,
                        ]}
                        onPress={() =>
                          setTempProfile({ ...tempProfile, gender: "female" })
                        }>
                        <Text
                          style={[
                            styles.pickerText,
                            tempProfile.gender === "female" &&
                              styles.pickerTextSelected,
                          ]}>
                          F
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.value}>
                      {userProfile?.gender === "male" ? "Male" : "Female"}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Daily Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditingGoals) saveGoals();
                else setIsEditingGoals(true);
              }}>
              <Text style={styles.editButton}>
                {isEditingGoals ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Calories</Text>
              {isEditingGoals ? (
                <TextInput
                  style={styles.goalInput}
                  value={tempGoals.calories.toString()}
                  onChangeText={(text) =>
                    setTempGoals({
                      ...tempGoals,
                      calories: parseInt(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.goalValue}>{dailyGoals.calories}</Text>
              )}
              <Text style={styles.goalUnit}>kcal</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.macrosRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                {isEditingGoals ? (
                  <TextInput
                    style={styles.macroInput}
                    value={tempGoals.protein.toString()}
                    onChangeText={(text) =>
                      setTempGoals({
                        ...tempGoals,
                        protein: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.macroValue}>{dailyGoals.protein}g</Text>
                )}
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                {isEditingGoals ? (
                  <TextInput
                    style={styles.macroInput}
                    value={tempGoals.carbs.toString()}
                    onChangeText={(text) =>
                      setTempGoals({
                        ...tempGoals,
                        carbs: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.macroValue}>{dailyGoals.carbs}g</Text>
                )}
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                {isEditingGoals ? (
                  <TextInput
                    style={styles.macroInput}
                    value={tempGoals.fat.toString()}
                    onChangeText={(text) =>
                      setTempGoals({ ...tempGoals, fat: parseInt(text) || 0 })
                    }
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.macroValue}>{dailyGoals.fat}g</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContent}>
            <Text style={styles.aboutText}>MacrosAI Food Log App v1.0.0</Text>
            <Text style={styles.aboutDescription}>
              AI-powered food tracking application using Google Gemini for
              accurate nutrition analysis.
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: "#ef4444" }]}>
              Danger Zone
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 20,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  editButton: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
    paddingVertical: 8,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  pickerContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  pickerSelected: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  pickerTextSelected: {
    color: "#10B981",
    fontWeight: "600",
  },
  goalsContainer: {
    gap: 16,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  goalLabel: {
    fontSize: 16,
    color: "#6b7280",
    marginRight: 8,
  },
  goalValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
  },
  goalInput: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#10B981",
    minWidth: 80,
    textAlign: "center",
  },
  goalUnit: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  macroInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#10B981",
    minWidth: 40,
    textAlign: "center",
  },
  aboutContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  aboutText: {
    fontSize: 16,
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
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  dangerSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 14,
  },
});
