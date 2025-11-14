import type { Schema } from "@/amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  weight: number;
  unit: string;
  macronutrients: {
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
    macronutrients?: {
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
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dailyCalorieGoal?: number;
  createdAt: number;
  updatedAt: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

class AmplifyStorageService {
  // Get current user ID
  private async getCurrentUserId(): Promise<string> {
    try {
      const { userId } = await getCurrentUser();
      return userId;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw new Error("User not authenticated");
    }
  }

  // Food Entries Management
  async saveFoodEntry(entryData: Omit<FoodEntry, "id">): Promise<FoodEntry> {
    try {
      const userId = await this.getCurrentUserId();

      // Calculate totals from foodItems
      const computedMacros = entryData.analysis.foodItems.reduce(
        (sum, item) => ({
          protein: sum.protein + (item.macronutrients?.protein || 0),
          carbs: sum.carbs + (item.macronutrients?.carbs || 0),
          fat: sum.fat + (item.macronutrients?.fat || 0),
          fiber: sum.fiber + (item.macronutrients?.fiber || 0),
        }),
        { protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      // Create FoodEntry in Amplify
      const { data: foodEntry, errors } = await client.models.FoodEntry.create({
        userId,
        timestamp: new Date(entryData.timestamp).toISOString(),
        imageUrl: entryData.imageUri,
        totalCalories: entryData.analysis.totalCalories,
        confidence: entryData.analysis.confidence,
        mealType: entryData.mealType,
        notes: entryData.notes,
        isManual: entryData.isManual || false,
        protein: computedMacros.protein,
        carbs: computedMacros.carbs,
        fat: computedMacros.fat,
        fiber: computedMacros.fiber,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      // Create FoodItems for this entry
      for (const item of entryData.analysis.foodItems) {
        await client.models.FoodItem.create({
          foodEntryId: foodEntry!.id,
          name: item.name,
          calories: item.calories,
          weight: item.weight,
          unit: item.unit,
          protein: item.macronutrients.protein,
          carbs: item.macronutrients.carbs,
          fat: item.macronutrients.fat,
          fiber: item.macronutrients.fiber,
          confidence: item.confidence,
          portionAmount: item.portion.amount,
          portionUnit: item.portion.unit,
        });
      }

      return {
        id: foodEntry!.id,
        timestamp: entryData.timestamp,
        imageUri: entryData.imageUri,
        analysis: {
          ...entryData.analysis,
          macronutrients: computedMacros,
        },
        mealType: entryData.mealType,
        notes: entryData.notes,
        isManual: entryData.isManual,
      };
    } catch (error) {
      console.error("Error saving food entry:", error);
      throw error;
    }
  }

  async getFoodEntries(): Promise<FoodEntry[]> {
    try {
      const userId = await this.getCurrentUserId();

      const { data: entries } = await client.models.FoodEntry.list({
        filter: { userId: { eq: userId } },
      });

      const foodEntries: FoodEntry[] = [];

      for (const entry of entries) {
        // Get food items for this entry
        const { data: foodItems } = await client.models.FoodItem.list({
          filter: { foodEntryId: { eq: entry.id } },
        });

        const mappedFoodItems: FoodItem[] = foodItems.map((item) => ({
          id: item.id,
          name: item.name,
          calories: item.calories,
          weight: item.weight,
          unit: item.unit,
          macronutrients: {
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
          },
          confidence: item.confidence,
          portion: {
            amount: item.portionAmount,
            unit: item.portionUnit,
          },
        }));

        foodEntries.push({
          id: entry.id,
          timestamp: new Date(entry.timestamp).getTime(),
          imageUri: entry.imageUrl || "",
          analysis: {
            totalCalories: entry.totalCalories,
            confidence: entry.confidence,
            foodItems: mappedFoodItems,
            macronutrients: {
              protein: entry.protein,
              carbs: entry.carbs,
              fat: entry.fat,
              fiber: entry.fiber,
            },
          },
          mealType: entry.mealType as any,
          notes: entry.notes || "",
          isManual: entry.isManual || false,
        });
      }

      return foodEntries.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error getting food entries:", error);
      return [];
    }
  }

  async deleteFoodEntry(entryId: string): Promise<void> {
    try {
      // Delete associated food items first
      const { data: foodItems } = await client.models.FoodItem.list({
        filter: { foodEntryId: { eq: entryId } },
      });

      for (const item of foodItems) {
        await client.models.FoodItem.delete({ id: item.id });
      }

      // Delete the entry
      await client.models.FoodEntry.delete({ id: entryId });
    } catch (error) {
      console.error("Error deleting food entry:", error);
      throw error;
    }
  }

  // User Profile Management
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      const { data: existingProfile } = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } },
      });

      if (existingProfile.length > 0) {
        await client.models.UserProfile.update({
          id: existingProfile[0].id,
          name: profile.name,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          activityLevel: profile.activityLevel as any,
          dailyCalorieGoal: profile.dailyCalorieGoal,
        });
      } else {
        await client.models.UserProfile.create({
          userId,
          name: profile.name,
          email: "", // You might want to get this from Auth
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          activityLevel: profile.activityLevel as any,
          dailyCalorieGoal: profile.dailyCalorieGoal,
        });
      }
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data: profiles } = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } },
      });

      if (profiles.length === 0) return null;

      const profile = profiles[0];
      return {
        name: profile.name,
        age: profile.age || undefined,
        weight: profile.weight || undefined,
        height: profile.height || undefined,
        activityLevel: profile.activityLevel as any,
        dailyCalorieGoal: profile.dailyCalorieGoal || undefined,
        createdAt: new Date(profile.createdAt!).getTime(),
        updatedAt: new Date(profile.updatedAt!).getTime(),
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  // Daily Goals Management
  async saveDailyGoals(goals: DailyGoals): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      const { data: existingGoals } = await client.models.DailyGoals.list({
        filter: { userId: { eq: userId } },
      });

      if (existingGoals.length > 0) {
        await client.models.DailyGoals.update({
          id: existingGoals[0].id,
          calories: Math.round(goals.calories),
          protein: goals.protein,
          carbs: goals.carbs,
          fat: goals.fat,
          fiber: goals.fiber,
        });
      } else {
        await client.models.DailyGoals.create({
          userId,
          calories: Math.round(goals.calories),
          protein: goals.protein,
          carbs: goals.carbs,
          fat: goals.fat,
          fiber: goals.fiber,
        });
      }
    } catch (error) {
      console.error("Error saving daily goals:", error);
      throw error;
    }
  }

  async getDailyGoals(): Promise<DailyGoals | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data: goals } = await client.models.DailyGoals.list({
        filter: { userId: { eq: userId } },
      });

      if (goals.length === 0) return null;

      const goal = goals[0];
      return {
        calories: goal.calories,
        protein: goal.protein,
        carbs: goal.carbs,
        fat: goal.fat,
        fiber: goal.fiber,
      };
    } catch (error) {
      console.error("Error getting daily goals:", error);
      return null;
    }
  }

  // API Key Management (store Gemini key)
  async saveGeminiApiKey(apiKey: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      const { data: existingKeys } = await client.models.ApiKey.list({
        filter: {
          userId: { eq: userId },
          service: { eq: "gemini" },
        },
      });

      if (existingKeys.length > 0) {
        await client.models.ApiKey.update({
          id: existingKeys[0].id,
          encryptedKey: apiKey, // Note: You should encrypt this in production
        });
      } else {
        await client.models.ApiKey.create({
          userId,
          service: "gemini",
          encryptedKey: apiKey, // Note: You should encrypt this in production
        });
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      throw error;
    }
  }

  async getGeminiApiKey(): Promise<string | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data: keys } = await client.models.ApiKey.list({
        filter: {
          userId: { eq: userId },
          service: { eq: "gemini" },
        },
      });

      if (keys.length === 0) return null;

      return keys[0].encryptedKey;
    } catch (error) {
      console.error("Error getting API key:", error);
      return null;
    }
  }

  // Daily Stats
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
    const entries = await this.getFoodEntries();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfDay && entryDate <= endOfDay;
    });

    const totalCalories = dayEntries.reduce(
      (sum, entry) => sum + entry.analysis.totalCalories,
      0
    );

    const nutritionBreakdown = dayEntries.reduce(
      (sum, entry) => ({
        protein: sum.protein + (entry.analysis.macronutrients?.protein || 0),
        carbs: sum.carbs + (entry.analysis.macronutrients?.carbs || 0),
        fat: sum.fat + (entry.analysis.macronutrients?.fat || 0),
        fiber: sum.fiber + (entry.analysis.macronutrients?.fiber || 0),
      }),
      { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return {
      totalCalories,
      totalMeals: dayEntries.length,
      nutritionBreakdown,
    };
  }
}

export const amplifyStorageService = new AmplifyStorageService();
