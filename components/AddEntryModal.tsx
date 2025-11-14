import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddEntryModal({ visible, onClose }: AddEntryModalProps) {
  const handleAddWithPhoto = () => {
    onClose();
    router.push({
      pathname: "/add-entry-date" as Href,
      params: { mode: "photo" },
    } as any);
  };

  const handleAddManually = () => {
    onClose();
    router.push({
      pathname: "/add-entry-date" as Href,
      params: { mode: "manual" },
    } as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Past Entry</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Choose how you'd like to add your meal
            </Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAddWithPhoto}>
              <View style={styles.optionIconContainer}>
                <Ionicons name="camera" size={24} color="#10B981" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Add with Photo</Text>
                <Text style={styles.optionDescription}>
                  Take or select a photo for AI analysis
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAddManually}>
              <View style={styles.optionIconContainer}>
                <Ionicons name="create" size={24} color="#10B981" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Add Manually</Text>
                <Text style={styles.optionDescription}>
                  Enter nutrition information yourself
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B98115",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
});
