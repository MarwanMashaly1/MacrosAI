import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // User Profile
  UserProfile: a
    .model({
      userId: a.id().required(),
      name: a.string().required(),
      email: a.email().required(),
      age: a.integer(),
      weight: a.float(),
      height: a.float(),
      activityLevel: a.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
      dailyCalorieGoal: a.integer(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization(allow => [allow.owner()]),

  // Daily Goals
  DailyGoals: a
    .model({
      userId: a.id().required(),
      calories: a.integer().required(),
      protein: a.float().required(),
      carbs: a.float().required(),
      fat: a.float().required(),
      fiber: a.float().required(),
      updatedAt: a.datetime(),
    })
    .authorization(allow => [allow.owner()]),

  // Food Entry
  FoodEntry: a
    .model({
      userId: a.id().required(),
      timestamp: a.datetime().required(),
      imageUrl: a.string(),
      imageKey: a.string(), // S3 key for image
      totalCalories: a.float().required(),
      confidence: a.integer().required(),
      mealType: a.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      notes: a.string(),
      isManual: a.boolean().default(false),
      // Nutrition summary (denormalized for performance)
      protein: a.float().required(),
      carbs: a.float().required(),
      fat: a.float().required(),
      fiber: a.float().required(),
      // Relations
      foodItems: a.hasMany('FoodItem', 'foodEntryId'),
    })
    .authorization(allow => [allow.owner()]),

  // Food Item
  FoodItem: a
    .model({
      foodEntryId: a.id().required(),
      name: a.string().required(),
      calories: a.float().required(),
      weight: a.float().required(),
      unit: a.string().required(),
      protein: a.float().required(),
      carbs: a.float().required(),
      fat: a.float().required(),
      fiber: a.float().required(),
      confidence: a.integer().required(),
      portionAmount: a.float().required(),
      portionUnit: a.string().required(),
      // Relation
      foodEntry: a.belongsTo('FoodEntry', 'foodEntryId'),
    })
    .authorization(allow => [allow.owner()]),

  // API Key Storage (encrypted)
  ApiKey: a
    .model({
      userId: a.id().required(),
      service: a.string().required(), // 'gemini'
      encryptedKey: a.string().required(),
      updatedAt: a.datetime(),
    })
    .authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
