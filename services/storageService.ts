import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Web storage adapter for localStorage
const webStorage = {
  async setItemAsync(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
  async getItemAsync(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  },
  async deleteItemAsync(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
};

// Use appropriate storage based on platform
const storage = Platform.OS === "web" ? webStorage : SecureStore;

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  weight: number;
  unit: string;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  confidence: number;
  portion: {
    amount: number;
    unit: string;
  };
}

export interface FoodEntry {
  id: string;
  timestamp: number;
  imageUri: string;
  analysis: {
    totalCalories: number;
    confidence: number;
    foodItems: FoodItem[];
    nutritionSummary: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  notes?: string;
  isManual?: boolean;
}

export interface UserProfile {
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: "male" | "female";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dailyCalorieGoal?: number;
  createdAt: number;
  updatedAt: number;
  goal?: "maintain" | "lose" | "gain";
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

class StorageService {
  private readonly FOOD_ENTRIES_KEY = "food_entries";
  private readonly USER_PROFILE_KEY = "user_profile";
  private readonly DAILY_GOALS_KEY = "daily_goals";

  // Food Entries Management
  async saveFoodEntry(entryData: Omit<FoodEntry, "id">): Promise<FoodEntry> {
    try {
      // Compute totals from foodItems if not provided
      const computedNutritionSummary = entryData.analysis.foodItems.reduce(
        (sum, item) => ({
          protein: sum.protein + (item.nutrients?.protein || 0),
          carbs: sum.carbs + (item.nutrients?.carbs || 0),
          fat: sum.fat + (item.nutrients?.fat || 0),
          fiber: sum.fiber + (item.nutrients?.fiber || 0),
        }),
        { protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      const entry: FoodEntry = {
        ...entryData,
        id: Math.random().toString(36).substring(2, 11),
        analysis: {
          ...entryData.analysis,
          nutritionSummary:
            entryData.analysis.nutritionSummary || computedNutritionSummary,
        },
      };

      const existingEntries = await this.getFoodEntries();
      const updatedEntries = [entry, ...existingEntries];
      await storage.setItemAsync(
        this.FOOD_ENTRIES_KEY,
        JSON.stringify(updatedEntries)
      );

      return entry;
    } catch (error) {
      console.error("Error saving food entry:", error);
      throw error;
    }
  }

  async getFoodEntries(): Promise<FoodEntry[]> {
    try {
      const entriesJson = await storage.getItemAsync(this.FOOD_ENTRIES_KEY);
      return entriesJson ? JSON.parse(entriesJson) : [];
    } catch (error) {
      console.error("Error getting food entries:", error);
      return [];
    }
  }

  async getFoodEntriesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<FoodEntry[]> {
    const allEntries = await this.getFoodEntries();
    return allEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  async deleteFoodEntry(entryId: string): Promise<void> {
    try {
      const existingEntries = await this.getFoodEntries();
      const updatedEntries = existingEntries.filter(
        (entry) => entry.id !== entryId
      );
      await storage.setItemAsync(
        this.FOOD_ENTRIES_KEY,
        JSON.stringify(updatedEntries)
      );
    } catch (error) {
      console.error("Error deleting food entry:", error);
      throw error;
    }
  }

  async updateFoodEntry(
    entryId: string,
    updates: Partial<FoodEntry>
  ): Promise<void> {
    try {
      const existingEntries = await this.getFoodEntries();
      const updatedEntries = existingEntries.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      );
      await storage.setItemAsync(
        this.FOOD_ENTRIES_KEY,
        JSON.stringify(updatedEntries)
      );
    } catch (error) {
      console.error("Error updating food entry:", error);
      throw error;
    }
  }

  // User Profile Management
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await storage.setItemAsync(
        this.USER_PROFILE_KEY,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileJson = await storage.getItemAsync(this.USER_PROFILE_KEY);
      return profileJson ? JSON.parse(profileJson) : null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  // Daily Goals Management
  async saveDailyGoals(goals: DailyGoals): Promise<void> {
    try {
      await storage.setItemAsync(this.DAILY_GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error("Error saving daily goals:", error);
      throw error;
    }
  }

  async getDailyGoals(): Promise<DailyGoals | null> {
    try {
      const goalsJson = await storage.getItemAsync(this.DAILY_GOALS_KEY);
      return goalsJson ? JSON.parse(goalsJson) : null;
    } catch (error) {
      console.error("Error getting daily goals:", error);
      return null;
    }
  }

  // Analytics and Statistics
  async getDailyStats(date: Date): Promise<{
    totalCalories: number;
    totalMeals: number;
    nutritionBreakdown: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await this.getFoodEntriesByDateRange(startOfDay, endOfDay);

    const totalCalories = entries.reduce(
      (sum, entry) => sum + (entry.analysis?.totalCalories || 0),
      0
    );
    const totalMeals = entries.length;

    const nutritionBreakdown = entries.reduce(
      (sum, entry) => {
        const nutrition = entry.analysis?.nutritionSummary || {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        };

        return {
          protein: sum.protein + (nutrition.protein || 0),
          carbs: sum.carbs + (nutrition.carbs || 0),
          fat: sum.fat + (nutrition.fat || 0),
          fiber: sum.fiber + (nutrition.fiber || 0),
        };
      },
      { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return {
      totalCalories,
      totalMeals,
      nutritionBreakdown,
    };
  }

  async getWeeklyStats(weekStartDate: Date): Promise<{
    dailyStats: {
      date: string;
      calories: number;
      meals: number;
    }[];
    weeklyAverage: number;
    totalCalories: number;
  }> {
    const dailyStats = [];
    let totalCalories = 0;

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(weekStartDate.getDate() + i);

      const dayStats = await this.getDailyStats(currentDate);

      dailyStats.push({
        date: currentDate.toISOString().split("T")[0],
        calories: dayStats.totalCalories,
        meals: dayStats.totalMeals,
      });

      totalCalories += dayStats.totalCalories;
    }

    return {
      dailyStats,
      weeklyAverage: Math.round(totalCalories / 7),
      totalCalories,
    };
  }

  // Clear all data (for testing/reset purposes)
  async clearAllData(): Promise<void> {
    try {
      await storage.deleteItemAsync(this.FOOD_ENTRIES_KEY);
      await storage.deleteItemAsync(this.USER_PROFILE_KEY);
      await storage.deleteItemAsync(this.DAILY_GOALS_KEY);
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }

  // Manual entry method
  async saveManualFoodEntry(entry: Omit<FoodEntry, "id">): Promise<string> {
    try {
      const newEntry = await this.saveFoodEntry({
        ...entry,
        isManual: true,
      });
      return newEntry.id;
    } catch (error) {
      console.error("Error saving manual food entry:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();

const USER_SESSION_KEY = "user_session_token";

export const sessionStorageService = {
  async saveSession(session: string): Promise<void> {
    await SecureStore.setItemAsync(USER_SESSION_KEY, session);
  },

  async getSession(): Promise<string | null> {
    return await SecureStore.getItemAsync(USER_SESSION_KEY);
  },

  async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_SESSION_KEY);
  },
};
