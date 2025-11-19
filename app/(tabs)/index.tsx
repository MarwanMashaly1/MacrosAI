import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { storageService } from "../../services/storageService";

const { width } = Dimensions.get("window");

interface DailyStat {
  label: string;
  value: string;
  unit: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface TodayStats {
  totalCalories: number;
  totalMeals: number;
  goalProgress: number;
  nutritionBreakdown: any;
}

export default function HomeScreen() {
  const [greeting, setGreeting] = useState("");
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalCalories: 0,
    totalMeals: 0,
    goalProgress: 0,
    nutritionBreakdown: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
  });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(2000);

  const loadTodayData = useCallback(async () => {
    try {
      const today = new Date();
      const stats = await storageService.getDailyStats(today);
      const entries = await storageService.getFoodEntries();
      const goals = await storageService.getDailyGoals();

      const currentGoal = goals?.calories || 2000;
      setDailyGoal(currentGoal);

      setTodayStats({
        totalCalories: stats.totalCalories,
        totalMeals: stats.totalMeals,
        goalProgress: Math.round((stats.totalCalories / currentGoal) * 100),
        nutritionBreakdown: stats.nutritionBreakdown,
      });

      setRecentEntries(entries.slice(0, 3));
    } catch (error) {
      console.error("Error loading today data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
      loadTodayData();
    }, [loadTodayData])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadTodayData();
    setIsRefreshing(false);
  };

  const dailyStats: DailyStat[] = [
    {
      label: "Calories Today",
      value: todayStats.totalCalories.toLocaleString(),
      unit: "kcal",
      iconName: "flash",
      color: "#10B981",
    },
    {
      label: "Goal Progress",
      value: todayStats.goalProgress.toString(),
      unit: "%",
      iconName: "checkmark-circle",
      color: "#3B82F6",
    },
    {
      label: "Meals Today",
      value: todayStats.totalMeals.toString(),
      unit: "meals",
      iconName: "restaurant",
      color: "#F97316",
    },
  ];

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  const proTips = [
    {
      id: "photo-tips",
      title: "📸 Better Photos = Better Results",
      text: "Take photos from directly above your food with good lighting for the most accurate calorie estimates.",
    },
    {
      id: "goal-setting",
      title: "🎯 Set Your Daily Goals",
      text: "Customize your daily calorie and nutrition goals in the settings to track your progress more effectively.",
    },
    {
      id: "progress-tracking",
      title: "📊 Track Your Progress",
      text: "View detailed nutrition breakdowns and weekly trends in the History tab to understand your eating patterns.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>
            Track your nutrition with precision
          </Text>
        </View>

        {/* Daily Stats */}
        <View style={styles.statsContainer}>
          {dailyStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${stat.color}15` },
                ]}>
                <Ionicons name={stat.iconName} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>
                {stat.value}
                <Text style={styles.statUnit}> {stat.unit}</Text>
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Daily Goal Progress */}
        <View style={styles.goalProgressContainer}>
          <Text style={styles.goalProgressTitle}>Daily Goal Progress</Text>
          <View style={styles.goalProgressBar}>
            <View
              style={[
                styles.goalProgressFill,
                { width: `${Math.min(todayStats.goalProgress, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.goalProgressText}>
            {todayStats.totalCalories} / {dailyGoal} calories (
            {todayStats.goalProgress}%)
          </Text>
        </View>

        {/* Quick Scan Button */}
        <TouchableOpacity
          style={styles.quickScanButton}
          onPress={() => router.push("/(tabs)/camera")}
          activeOpacity={0.8}>
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.quickScanGradient}>
            <Ionicons name="camera" size={32} color="#ffffff" />
            <View style={styles.quickScanText}>
              <Text style={styles.quickScanTitle}>Quick Scan</Text>
              <Text style={styles.quickScanSubtitle}>Capture your meal</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Scans */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentEntries.length > 0 ? (
            recentEntries.map((entry, index) => (
              <TouchableOpacity
                key={entry.id || `entry-${index}`}
                style={styles.recentItem}
                onPress={() =>
                  router.push({
                    pathname: "/results",
                    params: { entryId: entry.id },
                  })
                }>
                <View style={styles.recentIcon}>
                  <Ionicons name="restaurant" size={20} color="#10B981" />
                </View>
                <View style={styles.recentContent}>
                  <Text style={styles.recentFood} numberOfLines={1}>
                    {entry.analysis.foodItems[0]?.name || "Food Item"}
                  </Text>
                  <Text style={styles.recentTime}>
                    {formatTimeAgo(entry.timestamp)}
                  </Text>
                </View>
                <Text style={styles.recentCalories}>
                  {entry.analysis.totalCalories} kcal
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEntriesText}>
              No recent scans. Start by capturing your first meal!
            </Text>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          {proTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
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
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "400",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  goalProgressContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  goalProgressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  quickScanButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  quickScanGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
  },
  quickScanText: {
    flex: 1,
    marginLeft: 16,
  },
  quickScanTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  quickScanSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
    marginTop: 2,
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B98115",
    alignItems: "center",
    justifyContent: "center",
  },
  recentContent: {
    flex: 1,
    marginLeft: 12,
  },
  recentFood: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  recentTime: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  recentCalories: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  noEntriesText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  tipCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
