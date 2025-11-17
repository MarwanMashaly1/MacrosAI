import { GoogleGenerativeAI } from "@google/generative-ai";
import { storageService } from "./storageService";

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

export interface FoodItem {
  name: string;
  calories: number;
  weight: string;
  confidence: number;
  nutrients?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface IdentifiedItem {
  name: string;
  quantity: string; // Changed from number to string
  estimated_size: string;
  confidence: number;
}

export interface IdentificationResult {
  items: IdentifiedItem[];
  confidence: number;
}

export interface NutritionAnalysis {
  foodItems: FoodItem[];
  totalCalories: number;
  totalWeight: string;
  processingTime: string;
  confidence: number;
  nutritionSummary: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export class GeminiService {
  private async getModel() {
    const apiKey = await storageService.getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please set it in Settings.");
    }

    if (!genAI) {
      genAI = new GoogleGenerativeAI(apiKey);
    }

    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async identifyFood(imageUri: string): Promise<IdentificationResult> {
    try {
      const model = await this.getModel();

      const prompt = `
        Analyze this food image and identify all visible food items. Please respond with a JSON object containing:

        {
          "items": [
            {
              "name": "food item name",
              "quantity": "number and unit (e.g., '2 pieces', '1 cup', '100g')",
              "estimated_size": "description of portion size (e.g., 'medium', 'large bowl', 'small serving')",
              "confidence": confidence_percentage_0_to_100
            }
          ],
          "confidence": overall_confidence_0_to_100
        }

        Instructions:
        - Identify each visible food item separately
        - Estimate quantities and portion sizes based on visual cues
        - Be specific about the food items (e.g., "grilled chicken breast" not just "chicken")
        - Include confidence scores based on visibility and recognizability
        - Consider typical serving sizes

        Only respond with the JSON object, no additional text.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageUri,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      const identificationData = JSON.parse(
        text.replace(/```json\n?|\n?```/g, "")
      );

      return identificationData;
    } catch (error) {
      console.error("Gemini API Error:", error);

      return {
        items: [
          {
            name: "Unknown Food Item",
            quantity: "1 serving", // Changed from number to string
            estimated_size: "medium",
            confidence: 50,
          },
        ],
        confidence: 50,
      };
    }
  }

  async calculateNutrition(
    items: { name: string; quantity: string; estimated_size: string }[]
  ): Promise<NutritionAnalysis> {
    const startTime = Date.now();

    try {
      const model = await this.getModel();

      const itemsText = items
        .map(
          (item, i) =>
            `${i + 1}. ${item.name} - ${item.quantity} (${item.estimated_size})`
        )
        .join("\n");

      const prompt = `
        Calculate detailed nutritional information for these food items:

        ${itemsText}

        Please respond with a JSON object containing:

        {
          "foodItems": [
            {
              "name": "food item name",
              "calories": estimated_calories_number,
              "weight": "estimated_weight_in_grams",
              "confidence": confidence_percentage_0_to_100,
              "nutrients": {
                "protein": grams,
                "carbs": grams,
                "fat": grams,
                "fiber": grams
              }
            }
          ],
          "totalCalories": total_calories_number,
          "totalWeight": "total_weight_in_grams",
          "confidence": overall_confidence_0_to_100,
          "nutritionSummary": {
            "protein": total_protein_grams,
            "carbs": total_carbs_grams,
            "fat": total_fat_grams,
            "fiber": total_fiber_grams
          }
        }

        Instructions:
        - Provide realistic calorie and nutrition estimates based on the quantities and sizes specified
        - Use standard nutritional databases and typical values
        - Be as accurate as possible with nutritional data
        - Consider the specified portion sizes when calculating

        Only respond with the JSON object, no additional text.
      `;

      const result = await model.generateContent([prompt]);

      const response = await result.response;
      const text = response.text();

      const analysisData = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + "s";

      return {
        ...analysisData,
        processingTime,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + "s";

      return {
        foodItems: items.map((item) => ({
          name: item.name,
          calories: 200,
          weight: "100g",
          confidence: 60,
          nutrients: {
            protein: 10,
            carbs: 20,
            fat: 8,
            fiber: 3,
          },
        })),
        totalCalories: items.length * 200,
        totalWeight: items.length * 100 + "g",
        processingTime,
        confidence: 60,
        nutritionSummary: {
          protein: items.length * 10,
          carbs: items.length * 20,
          fat: items.length * 8,
          fiber: items.length * 3,
        },
      };
    }
  }

  async analyzeFood(imageUri: string): Promise<NutritionAnalysis> {
    const startTime = Date.now();

    try {
      const model = await this.getModel();

      const prompt = `
        Analyze this food image and provide detailed nutritional information. Please respond with a JSON object containing:
        
        {
          "foodItems": [
            {
              "name": "food item name",
              "calories": estimated_calories_number,
              "weight": "estimated_weight_in_grams",
              "confidence": confidence_percentage_0_to_100,
              "nutrients": {
                "protein": grams,
                "carbs": grams,
                "fat": grams,
                "fiber": grams
              }
            }
          ],
          "totalCalories": total_calories_number,
          "totalWeight": "total_weight_in_grams",
          "confidence": overall_confidence_0_to_100,
          "nutritionSummary": {
            "protein": total_protein_grams,
            "carbs": total_carbs_grams,
            "fat": total_fat_grams,
            "fiber": total_fiber_grams
          }
        }

        Instructions:
        - Identify each visible food item separately
        - Estimate portion sizes based on visual cues
        - Provide realistic calorie estimates
        - Include confidence scores based on visibility and recognizability
        - Consider typical serving sizes for accuracy
        - If multiple items, analyze each one individually
        - Be as accurate as possible with nutritional data
        
        Only respond with the JSON object, no additional text.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageUri,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const analysisData = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + "s";

      return {
        ...analysisData,
        processingTime,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);

      // Fallback response if API fails
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + "s";

      return {
        foodItems: [
          {
            name: "Mixed Food Items",
            calories: 350,
            weight: "200g",
            confidence: 75,
            nutrients: {
              protein: 20,
              carbs: 35,
              fat: 15,
              fiber: 5,
            },
          },
        ],
        totalCalories: 350,
        totalWeight: "200g",
        processingTime,
        confidence: 75,
        nutritionSummary: {
          protein: 20,
          carbs: 35,
          fat: 15,
          fiber: 5,
        },
      };
    }
  }

  async batchAnalyze(imageUris: string[]): Promise<NutritionAnalysis[]> {
    const analyses = await Promise.all(
      imageUris.map((uri) => this.analyzeFood(uri))
    );
    return analyses;
  }

  // Get nutrition trends over time
  async getNutritionTrends(analyses: NutritionAnalysis[], days: number = 7) {
    const totalCalories = analyses.reduce(
      (sum, analysis) => sum + analysis.totalCalories,
      0
    );
    const avgCalories = totalCalories / Math.max(analyses.length, 1);

    const totalNutrients = analyses.reduce(
      (sum, analysis) => ({
        protein: sum.protein + analysis.nutritionSummary.protein,
        carbs: sum.carbs + analysis.nutritionSummary.carbs,
        fat: sum.fat + analysis.nutritionSummary.fat,
        fiber: sum.fiber + analysis.nutritionSummary.fiber,
      }),
      { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return {
      totalCalories,
      avgCalories: Math.round(avgCalories),
      avgNutrients: {
        protein: Math.round(
          totalNutrients.protein / Math.max(analyses.length, 1)
        ),
        carbs: Math.round(totalNutrients.carbs / Math.max(analyses.length, 1)),
        fat: Math.round(totalNutrients.fat / Math.max(analyses.length, 1)),
        fiber: Math.round(totalNutrients.fiber / Math.max(analyses.length, 1)),
      },
      totalMeals: analyses.length,
    };
  }
}

export const geminiService = new GeminiService();
