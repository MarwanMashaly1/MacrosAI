import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FoodEntry {
  id: string;
  image_uri: string;
  identified_items: IdentifiedItem[];
  nutrition_data: NutritionData | null;
  total_calories: number;
  created_at: string;
  updated_at: string;
}

export interface IdentifiedItem {
  name: string;
  quantity: string;
  estimated_size: string;
}

export interface NutritionData {
  items: NutritionItem[];
  total: NutritionSummary;
}

export interface NutritionItem {
  name: string;
  quantity: string;
  estimated_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
