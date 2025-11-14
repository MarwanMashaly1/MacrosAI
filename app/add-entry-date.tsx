import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddEntryDateScreen() {
  const params = useLocalSearchParams<{ mode: "photo" | "manual" }>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleContinue = () => {
    // Combine date and time
    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    // Check if date is in the future
    if (combinedDateTime > new Date()) {
      Alert.alert("Invalid Date", "Please select a date in the past");
      return;
    }

    const timestamp = combinedDateTime.getTime();

    if (params.mode === "photo") {
      // Navigate to camera with timestamp
      router.push({
        pathname: "/(tabs)/camera",
        params: {
          pastEntryTimestamp: timestamp.toString(),
        },
      });
    } else {
      // Navigate to manual entry form
      router.push({
        pathname: "/add-entry-manual",
        params: {
          timestamp: timestamp.toString(),
        },
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const maxDate = new Date(); // Today

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={24} color="#10B981" />
          <Text style={styles.infoText}>
            {params.mode === "photo"
              ? "Select when you had this meal, then take or choose a photo"
              : "Select when you had this meal, then enter the details manually"}
          </Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar" size={20} color="#10B981" />
            <Text style={styles.inputButtonText}>
              {formatDate(selectedDate)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Time</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time" size={20} color="#10B981" />
            <Text style={styles.inputButtonText}>
              {formatTime(selectedTime)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={maxDate}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleTimeChange}
          />
        )}

        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Selected Date & Time</Text>
          <Text style={styles.previewText}>
            {formatDate(selectedDate)} at {formatTime(selectedTime)}
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 20,
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "#10B98115",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#065f46",
    lineHeight: 20,
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
  inputButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  inputButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  previewContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  previewText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
