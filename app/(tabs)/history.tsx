import { AddEntryModal } from "@/components/AddEntryModal";
import { FoodEntry, storageService } from "@/services/storageService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router"; // Add this import
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface DayTotal {
  date: string;
  totalCalories: number;
  mealCount: number;
  avgAccuracy: number;
}

interface WeeklyStats {
  totalCalories: number;
  averageDaily: number;
  totalMeals: number;
  avgAccuracy: number;
}

export default function HistoryScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("week");
  const [viewMode, setViewMode] = useState<"entries" | "summary">("entries");
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalCalories: 0,
    averageDaily: 0,
    totalMeals: 0,
    avgAccuracy: 0,
  });
  const [dayTotals, setDayTotals] = useState<DayTotal[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  React.useEffect(() => {
    loadHistoryData();
  }, [selectedPeriod]);

  const loadHistoryData = async () => {
    try {
      const entries = await storageService.getFoodEntries();
      setFoodEntries(entries);

      // Calculate weekly stats
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);

      const weeklyEntries = entries.filter(
        (entry) => new Date(entry.timestamp) >= weekStart
      );

      const totalCalories = weeklyEntries.reduce(
        (sum, entry) => sum + entry.analysis.totalCalories,
        0
      );
      const avgAccuracy =
        weeklyEntries.length > 0
          ? weeklyEntries.reduce(
              (sum, entry) => sum + entry.analysis.confidence,
              0
            ) / weeklyEntries.length
          : 0;

      setWeeklyStats({
        totalCalories,
        averageDaily: Math.round(totalCalories / 7),
        totalMeals: weeklyEntries.length,
        avgAccuracy: Math.round(avgAccuracy),
      });

      // Calculate daily totals
      const dailyTotalsMap = new Map<
        string,
        { calories: number; meals: number; accuracy: number[] }
      >();

      weeklyEntries.forEach((entry) => {
        const date = new Date(entry.timestamp).toDateString();
        const existing = dailyTotalsMap.get(date) || {
          calories: 0,
          meals: 0,
          accuracy: [],
        };
        existing.calories += entry.analysis.totalCalories;
        existing.meals += 1;
        existing.accuracy.push(entry.analysis.confidence);
        dailyTotalsMap.set(date, existing);
      });

      const dailyTotalsArray = Array.from(dailyTotalsMap.entries())
        .map(([date, data]) => ({
          date: formatDateRelative(new Date(date)),
          totalCalories: data.calories,
          mealCount: data.meals,
          avgAccuracy: Math.round(
            data.accuracy.reduce((sum, acc) => sum + acc, 0) /
              data.accuracy.length
          ),
        }))
        .sort((a, b) => {
          // Sort by most recent first
          const dateA = new Date(
            a.date === "Today"
              ? new Date()
              : a.date === "Yesterday"
              ? new Date(Date.now() - 86400000)
              : a.date
          );
          const dateB = new Date(
            b.date === "Today"
              ? new Date()
              : b.date === "Yesterday"
              ? new Date(Date.now() - 86400000)
              : b.date
          );
          return dateB.getTime() - dateA.getTime();
        });

      setDayTotals(dailyTotalsArray);
    } catch (error) {
      console.error("Error loading history data:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadHistoryData();
    setIsRefreshing(false);
  };

  const formatDateRelative = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const entryDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (entryDate.getTime() === today.getTime()) {
      return "Today";
    } else if (entryDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const deleteEntry = async (entryId: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this food entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storageService.deleteFoodEntry(entryId);
              await loadHistoryData();
            } catch (error) {
              console.error("Error deleting entry:", error);
              Alert.alert("Error", "Failed to delete entry");
            }
          },
        },
      ]
    );
  };

  // Add navigation function
  const navigateToResults = (entryId: string) => {
    router.push({
      pathname: "/results",
      params: {
        entryId: entryId,
      },
    });
  };

  const renderFoodEntry = ({ item }: { item: FoodEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigateToResults(item.id)}
      activeOpacity={0.7}>
      <View style={styles.entryHeader}>
        <Image source={{ uri: item.imageUri }} style={styles.entryImage} />
        <View style={{ flex: 1 }}>
          <View style={styles.entryTitleRow}>
            <Text style={styles.entryFood}>
              {item.analysis.foodItems[0]?.name || "Food Item"}
            </Text>
            {item.isManual && (
              <View style={styles.manualEntryBadge}>
                <Ionicons name="create" size={12} color="#10B981" />
              </View>
            )}
          </View>
          <Text style={styles.entryTime}>
            {formatDateRelative(new Date(item.timestamp))} •{" "}
            {formatTime(item.timestamp)}
          </Text>
          {item.mealType && (
            <Text style={styles.entryMealType}>
              {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
            </Text>
          )}
        </View>
        <View style={styles.entryStats}>
          <Text style={styles.entryCalories}>
            {item.analysis.totalCalories} kcal
          </Text>
          <Text style={styles.entryAccuracy}>
            {item.analysis.confidence}% confidence
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card navigation when delete is pressed
              deleteEntry(item.id);
            }}>
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.entryFooter}>
        <Text style={styles.entryIngredients}>
          {item.analysis.foodItems.length} ingredients detected
        </Text>
        <View
          style={[
            styles.accuracyBadge,
            {
              backgroundColor:
                item.analysis.confidence >= 90 ? "#10B98115" : "#F9731615",
            },
          ]}>
          <Text
            style={[
              styles.accuracyBadgeText,
              { color: item.analysis.confidence >= 90 ? "#10B981" : "#F97316" },
            ]}>
            {item.analysis.confidence >= 90 ? "High" : "Medium"} Confidence
          </Text>
        </View>
        {item.notes && (
          <Text style={styles.entryNotes} numberOfLines={2}>
            Note: {item.notes}
          </Text>
        )}
      </View>

      {/* Add visual indicator that card is clickable */}
      <View style={styles.clickableIndicator}>
        <Ionicons name="chevron-forward" size={16} color="#10B981" />
        <Text style={styles.clickableText}>Tap to view details</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDayTotal = ({ item }: { item: DayTotal }) => (
    <View style={styles.dayTotalCard}>
      <View style={styles.dayTotalHeader}>
        <Text style={styles.dayTotalDate}>{item.date}</Text>
        <Text style={styles.dayTotalCalories}>{item.totalCalories} kcal</Text>
      </View>
      <View style={styles.dayTotalStats}>
        <Text style={styles.dayTotalStat}>
          {item.mealCount} meals • {item.avgAccuracy}% avg accuracy
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {["week", "month", "year"].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period as any)}>
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekly Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.statsGradient}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {weeklyStats.totalCalories.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Calories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.averageDaily}</Text>
              <Text style={styles.statLabel}>Daily Average</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.avgAccuracy}%</Text>
              <Text style={styles.statLabel}>Avg Accuracy</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "entries" && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode("entries")}>
          <Ionicons
            name="time"
            size={18}
            color={viewMode === "entries" ? "#10B981" : "#6b7280"}
          />
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === "entries" && styles.toggleButtonTextActive,
            ]}>
            All Entries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "summary" && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode("summary")}>
          <Ionicons
            name="bar-chart"
            size={18}
            color={viewMode === "summary" ? "#10B981" : "#6b7280"}
          />
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === "summary" && styles.toggleButtonTextActive,
            ]}>
            Daily Summary
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {viewMode === "entries" ? (
          <FlatList
            data={foodEntries}
            renderItem={renderFoodEntry}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No Food Entries Yet</Text>
                <Text style={styles.emptyText}>
                  Start tracking your meals by capturing photos in the Camera
                  tab
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={dayTotals}
            renderItem={renderDayTotal}
            keyExtractor={(item) => item.date}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No Daily Summaries</Text>
                <Text style={styles.emptyText}>
                  Daily summaries will appear here once you start logging meals
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Entry Modal */}
      <AddEntryModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonActive: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  periodButtonTextActive: {
    color: "#ffffff",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGradient: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.9,
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#10B98115",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  toggleButtonTextActive: {
    color: "#10B981",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Add padding for FAB
  },
  entryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  entryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  entryFood: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  entryTime: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  entryMealType: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
    marginTop: 2,
  },
  entryStats: {
    alignItems: "flex-end",
  },
  entryCalories: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  entryAccuracy: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  deleteButton: {
    marginTop: 8,
    padding: 4,
  },
  entryFooter: {
    gap: 8,
  },
  entryIngredients: {
    fontSize: 14,
    color: "#6b7280",
  },
  entryNotes: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  accuracyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  accuracyBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clickableIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  clickableText: {
    fontSize: 12,
    color: "#10B981",
    marginLeft: 4,
    fontWeight: "500",
  },
  dayTotalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dayTotalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayTotalDate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  dayTotalCalories: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
  },
  dayTotalStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayTotalStat: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  entryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manualEntryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B98115",
    alignItems: "center",
    justifyContent: "center",
  },
});
