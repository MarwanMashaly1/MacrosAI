// import { geminiService } from "@/services/geminiService";
// import { FoodEntry, storageService } from "@/services/storageService";
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import React, { useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // Conditional imports for camera functionality
// let CameraView: any;
// let CameraType: any;
// let useCameraPermissions: any;

// if (Platform.OS !== "web") {
//   try {
//     const cameraModule = require("expo-camera");
//     CameraView = cameraModule.CameraView;
//     CameraType = cameraModule.CameraType;
//     useCameraPermissions = cameraModule.useCameraPermissions;
//   } catch (error) {
//     console.log("Camera module not available");
//   }
// }

// // Web/fallback implementations
// if (!CameraView) {
//   CameraView = View;
//   CameraType = { back: "back", front: "front" };
//   useCameraPermissions = () => [{ granted: false }, () => {}];
// }

// interface FoodItem {
//   id: string;
//   name: string;
//   calories: number;
//   weight: string;
//   protein: number;
//   carbs: number;
//   fat: number;
//   fiber: number;
//   confidence: number;
// }

// export default function CameraTab() {
//   const [facing, setFacing] = useState<any>("back");
//   const [permission, requestPermission] = useCameraPermissions();
//   const [showCamera, setShowCamera] = useState(false);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [analyzing, setAnalyzing] = useState(false);
//   const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [mealType, setMealType] = useState<
//     "breakfast" | "lunch" | "dinner" | "snack"
//   >("lunch");
//   const [notes, setNotes] = useState("");
//   const [editingItem, setEditingItem] = useState<string | null>(null);
//   const cameraRef = useRef<any>(null);

//   // Check permissions for native platforms
//   const hasPermission = Platform.OS === "web" ? true : permission?.granted;
//   const needsPermission = Platform.OS !== "web" && !permission?.granted;

//   if (Platform.OS !== "web" && !permission) {
//     return <View style={styles.container} />;
//   }

//   if (needsPermission) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.permissionContainer}>
//           <Ionicons name="camera" size={64} color="#10B981" />
//           <Text style={styles.permissionTitle}>Camera Access Required</Text>
//           <Text style={styles.permissionText}>
//             We need camera access to capture photos of your food for analysis
//           </Text>
//           <TouchableOpacity
//             style={styles.permissionButton}
//             onPress={requestPermission}>
//             <Text style={styles.permissionButtonText}>Grant Permission</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const takePicture = async () => {
//     if (Platform.OS === "web") {
//       Alert.alert("Not Available", "Camera is not available on web platform");
//       return;
//     }

//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: true,
//         });
//         setCapturedImage(photo.uri);
//         setShowCamera(false);
//         await handleAnalyzeFood(photo.base64);
//       } catch (error) {
//         Alert.alert("Error", "Failed to take picture");
//         console.error("Camera error:", error);
//       }
//     }
//   };

//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: true,
//       });

//       if (!result.canceled && result.assets[0]) {
//         const asset = result.assets[0];
//         setCapturedImage(asset.uri);
//         await handleAnalyzeFood(asset.base64);
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to pick image");
//       console.error("Image picker error:", error);
//     }
//   };

//   const handleAnalyzeFood = async (base64?: string) => {
//     if (!base64) {
//       Alert.alert("Error", "Image data not available");
//       return;
//     }

//     setAnalyzing(true);
//     try {
//       const result = await geminiService.analyzeFood(base64);

//       // Convert analysis result to editable food items
//       const items: FoodItem[] = result.foodItems.map((item, index) => ({
//         id: `item-${index}`,
//         name: item.name,
//         calories: item.calories,
//         weight: item.weight,
//         protein: item.nutrients?.protein || 0,
//         carbs: item.nutrients?.carbs || 0,
//         fat: item.nutrients?.fat || 0,
//         fiber: item.nutrients?.fiber || 0,
//         confidence: item.confidence,
//       }));

//       setFoodItems(items);
//       setShowResultModal(true);
//     } catch (error) {
//       Alert.alert(
//         "Analysis Failed",
//         "Please check your API key in Settings and try again"
//       );
//       console.error("Analysis error:", error);
//     } finally {
//       setAnalyzing(false);
//     }
//   };

//   const updateFoodItem = (
//     id: string,
//     field: keyof FoodItem,
//     value: string | number
//   ) => {
//     setFoodItems((items) =>
//       items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
//     );
//   };

//   const addFoodItem = () => {
//     const newItem: FoodItem = {
//       id: `item-${Date.now()}`,
//       name: "New Food Item",
//       calories: 0,
//       weight: "0g",
//       protein: 0,
//       carbs: 0,
//       fat: 0,
//       fiber: 0,
//       confidence: 100,
//     };
//     setFoodItems([...foodItems, newItem]);
//   };

//   const removeFoodItem = (id: string) => {
//     setFoodItems((items) => items.filter((item) => item.id !== id));
//   };

//   const calculateTotals = () => {
//     return foodItems.reduce(
//       (totals, item) => ({
//         calories: totals.calories + item.calories,
//         protein: totals.protein + item.protein,
//         carbs: totals.carbs + item.carbs,
//         fat: totals.fat + item.fat,
//         fiber: totals.fiber + item.fiber,
//       }),
//       { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
//     );
//   };

//   const saveFoodLog = async () => {
//     if (!capturedImage || foodItems.length === 0) {
//       Alert.alert("Error", "No food items to save");
//       return;
//     }

//     const totals = calculateTotals();

//     const foodEntry: Omit<FoodEntry, "id" | "timestamp"> = {
//       imageUri: capturedImage,
//       mealType,
//       notes,
//       analysis: {
//         foodItems: foodItems.map((item) => ({
//           name: item.name,
//           calories: item.calories,
//           weight: item.weight,
//           confidence: item.confidence,
//           nutrients: {
//             protein: item.protein,
//             carbs: item.carbs,
//             fat: item.fat,
//             fiber: item.fiber,
//           },
//         })),
//         totalCalories: totals.calories,
//         totalWeight:
//           foodItems.reduce(
//             (total, item) => total + parseInt(item.weight) || 0,
//             0
//           ) + "g",
//         confidence: Math.round(
//           foodItems.reduce((sum, item) => sum + item.confidence, 0) /
//             foodItems.length
//         ),
//         nutritionSummary: {
//           protein: totals.protein,
//           carbs: totals.carbs,
//           fat: totals.fat,
//           fiber: totals.fiber,
//         },
//         processingTime: "0s",
//       },
//       totalCalories: totals.calories,
//       totalProtein: totals.protein,
//       totalCarbs: totals.carbs,
//       totalFat: totals.fat,
//       totalFiber: totals.fiber,
//     };

//     try {
//       await storageService.saveFoodEntry({
//         ...foodEntry,
//         id: `entry-${Date.now()}`,
//         timestamp: Date.now(),
//       });
//       Alert.alert("Success", "Food entry saved successfully!");
//       resetState();
//     } catch (error) {
//       Alert.alert("Error", "Failed to save food entry");
//       console.error("Save error:", error);
//     }
//   };

//   const resetState = () => {
//     setCapturedImage(null);
//     setFoodItems([]);
//     setShowResultModal(false);
//     setNotes("");
//     setMealType("lunch");
//     setEditingItem(null);
//   };

//   const toggleCameraFacing = () => {
//     setFacing((current: any) => (current === "back" ? "front" : "back"));
//   };

//   if (showCamera && Platform.OS !== "web") {
//     return (
//       <View style={styles.container}>
//         <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
//           <View style={styles.cameraOverlay}>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowCamera(false)}>
//               <Ionicons name="close" size={24} color="white" />
//             </TouchableOpacity>

//             <View style={styles.cameraControls}>
//               <TouchableOpacity
//                 style={styles.flipButton}
//                 onPress={toggleCameraFacing}>
//                 <Text style={styles.flipButtonText}>Flip</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.captureButton}
//                 onPress={takePicture}>
//                 <View style={styles.captureButtonInner} />
//               </TouchableOpacity>

//               <View style={styles.flipButton} />
//             </View>
//           </View>
//         </CameraView>
//       </View>
//     );
//   }

//   const totals = calculateTotals();

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <Ionicons name="restaurant" size={32} color="#10B981" />
//           <Text style={styles.title}>Food Analysis</Text>
//           <Text style={styles.subtitle}>
//             Capture or select a photo of your food to get detailed nutrition
//             information
//           </Text>
//         </View>

//         <View style={styles.actionButtons}>
//           {Platform.OS !== "web" ? (
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => setShowCamera(true)}>
//               <Ionicons name="camera" size={24} color="white" />
//               <Text style={styles.actionButtonText}>Take Photo</Text>
//             </TouchableOpacity>
//           ) : (
//             <View style={styles.webWarning}>
//               <Text style={styles.webWarningText}>
//                 Camera not supported on web. Please use gallery option below.
//               </Text>
//             </View>
//           )}

//           <TouchableOpacity
//             style={[styles.actionButton, styles.secondaryButton]}
//             onPress={pickImage}>
//             <Ionicons name="image" size={24} color="#10B981" />
//             <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
//               Choose from Gallery
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {analyzing && (
//           <View style={styles.analyzingContainer}>
//             <ActivityIndicator size="large" color="#10B981" />
//             <Text style={styles.analyzingText}>Analyzing your food...</Text>
//             <Text style={styles.analyzingSubtext}>
//               Using AI to identify ingredients and calculate nutrition
//             </Text>
//           </View>
//         )}
//       </ScrollView>

//       <Modal
//         visible={showResultModal}
//         animationType="slide"
//         presentationStyle="pageSheet">
//         <SafeAreaView style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Food Analysis Results</Text>
//             <TouchableOpacity onPress={() => setShowResultModal(false)}>
//               <Ionicons name="close" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.modalContent}>
//             {capturedImage && (
//               <Image
//                 source={{ uri: capturedImage }}
//                 style={styles.resultImage}
//               />
//             )}

//             {/* Nutrition Summary */}
//             <View style={styles.nutritionSummary}>
//               <Text style={styles.caloriesText}>
//                 {totals.calories} calories
//               </Text>
//               <View style={styles.macroRow}>
//                 <Text style={styles.macroText}>Protein: {totals.protein}g</Text>
//                 <Text style={styles.macroText}>Carbs: {totals.carbs}g</Text>
//                 <Text style={styles.macroText}>Fat: {totals.fat}g</Text>
//                 <Text style={styles.macroText}>Fiber: {totals.fiber}g</Text>
//               </View>
//             </View>

//             {/* Food Items List */}
//             <View style={styles.foodItemsSection}>
//               <View style={styles.sectionHeaderRow}>
//                 <Text style={styles.sectionTitle}>Food Items</Text>
//                 <TouchableOpacity
//                   style={styles.addButton}
//                   onPress={addFoodItem}>
//                   <Ionicons name="add" size={20} color="#10B981" />
//                   <Text style={styles.addButtonText}>Add Item</Text>
//                 </TouchableOpacity>
//               </View>

//               {foodItems.map((item) => (
//                 <View key={item.id} style={styles.foodItemCard}>
//                   <View style={styles.foodItemHeader}>
//                     <TextInput
//                       style={[
//                         styles.foodItemName,
//                         editingItem === item.id && styles.editing,
//                       ]}
//                       value={item.name}
//                       onChangeText={(text) =>
//                         updateFoodItem(item.id, "name", text)
//                       }
//                       onFocus={() => setEditingItem(item.id)}
//                       onBlur={() => setEditingItem(null)}
//                     />
//                     <TouchableOpacity
//                       style={styles.removeButton}
//                       onPress={() => removeFoodItem(item.id)}>
//                       <Ionicons name="remove" size={16} color="#ef4444" />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.foodItemDetails}>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Calories:</Text>
//                       <TextInput
//                         style={styles.detailInput}
//                         value={item.calories.toString()}
//                         onChangeText={(text) =>
//                           updateFoodItem(
//                             item.id,
//                             "calories",
//                             parseInt(text) || 0
//                           )
//                         }
//                         keyboardType="numeric"
//                       />
//                     </View>

//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Weight:</Text>
//                       <TextInput
//                         style={styles.detailInput}
//                         value={item.weight}
//                         onChangeText={(text) =>
//                           updateFoodItem(item.id, "weight", text)
//                         }
//                       />
//                     </View>

//                     <View style={styles.macroInputs}>
//                       <View style={styles.macroInput}>
//                         <Text style={styles.macroLabel}>Protein (g)</Text>
//                         <TextInput
//                           style={styles.macroValue}
//                           value={item.protein.toString()}
//                           onChangeText={(text) =>
//                             updateFoodItem(
//                               item.id,
//                               "protein",
//                               parseFloat(text) || 0
//                             )
//                           }
//                           keyboardType="numeric"
//                         />
//                       </View>
//                       <View style={styles.macroInput}>
//                         <Text style={styles.macroLabel}>Carbs (g)</Text>
//                         <TextInput
//                           style={styles.macroValue}
//                           value={item.carbs.toString()}
//                           onChangeText={(text) =>
//                             updateFoodItem(
//                               item.id,
//                               "carbs",
//                               parseFloat(text) || 0
//                             )
//                           }
//                           keyboardType="numeric"
//                         />
//                       </View>
//                       <View style={styles.macroInput}>
//                         <Text style={styles.macroLabel}>Fat (g)</Text>
//                         <TextInput
//                           style={styles.macroValue}
//                           value={item.fat.toString()}
//                           onChangeText={(text) =>
//                             updateFoodItem(
//                               item.id,
//                               "fat",
//                               parseFloat(text) || 0
//                             )
//                           }
//                           keyboardType="numeric"
//                         />
//                       </View>
//                       <View style={styles.macroInput}>
//                         <Text style={styles.macroLabel}>Fiber (g)</Text>
//                         <TextInput
//                           style={styles.macroValue}
//                           value={item.fiber.toString()}
//                           onChangeText={(text) =>
//                             updateFoodItem(
//                               item.id,
//                               "fiber",
//                               parseFloat(text) || 0
//                             )
//                           }
//                           keyboardType="numeric"
//                         />
//                       </View>
//                     </View>

//                     <View style={styles.confidenceRow}>
//                       <Text style={styles.confidenceText}>
//                         AI Confidence: {item.confidence}%
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               ))}
//             </View>

//             {/* Meal Type Selection */}
//             <View style={styles.mealTypeContainer}>
//               <Text style={styles.sectionTitle}>Meal Type</Text>
//               <View style={styles.mealTypeButtons}>
//                 {(["breakfast", "lunch", "dinner", "snack"] as const).map(
//                   (type) => (
//                     <TouchableOpacity
//                       key={type}
//                       style={[
//                         styles.mealTypeButton,
//                         mealType === type && styles.mealTypeButtonActive,
//                       ]}
//                       onPress={() => setMealType(type)}>
//                       <Text
//                         style={[
//                           styles.mealTypeButtonText,
//                           mealType === type && styles.mealTypeButtonTextActive,
//                         ]}>
//                         {type.charAt(0).toUpperCase() + type.slice(1)}
//                       </Text>
//                     </TouchableOpacity>
//                   )
//                 )}
//               </View>
//             </View>

//             {/* Notes */}
//             <View style={styles.notesContainer}>
//               <Text style={styles.sectionTitle}>Notes (Optional)</Text>
//               <TextInput
//                 style={styles.notesInput}
//                 placeholder="Add any notes about this meal..."
//                 value={notes}
//                 onChangeText={setNotes}
//                 multiline
//                 numberOfLines={3}
//               />
//             </View>
//           </ScrollView>

//           <View style={styles.modalActions}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.secondaryButton]}
//               onPress={() => setShowResultModal(false)}>
//               <Text
//                 style={[styles.actionButtonText, styles.secondaryButtonText]}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton} onPress={saveFoodLog}>
//               <Ionicons name="checkmark" size={20} color="white" />
//               <Text style={styles.actionButtonText}>Save Entry</Text>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//   },
//   scrollContent: {
//     flexGrow: 1,
//     padding: 20,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 40,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#1f2937",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#6b7280",
//     textAlign: "center",
//     lineHeight: 24,
//   },
//   actionButtons: {
//     gap: 16,
//     marginBottom: 40,
//   },
//   actionButton: {
//     backgroundColor: "#10B981",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 16,
//     borderRadius: 12,
//     gap: 8,
//   },
//   secondaryButton: {
//     backgroundColor: "white",
//     borderWidth: 2,
//     borderColor: "#10B981",
//   },
//   actionButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   secondaryButtonText: {
//     color: "#10B981",
//   },
//   analyzingContainer: {
//     alignItems: "center",
//     padding: 40,
//   },
//   analyzingText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1f2937",
//     marginTop: 16,
//   },
//   analyzingSubtext: {
//     fontSize: 14,
//     color: "#6b7280",
//     marginTop: 8,
//     textAlign: "center",
//   },
//   camera: {
//     flex: 1,
//   },
//   cameraOverlay: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "space-between",
//   },
//   closeButton: {
//     position: "absolute",
//     top: 60,
//     left: 20,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     borderRadius: 20,
//     padding: 8,
//   },
//   cameraControls: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//   },
//   flipButton: {
//     width: 60,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   flipButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   captureButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   captureButtonInner: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#10B981",
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   permissionTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1f2937",
//     marginTop: 20,
//     marginBottom: 12,
//   },
//   permissionText: {
//     fontSize: 16,
//     color: "#6b7280",
//     textAlign: "center",
//     lineHeight: 24,
//     marginBottom: 30,
//   },
//   permissionButton: {
//     backgroundColor: "#10B981",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   permissionButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1f2937",
//   },
//   modalContent: {
//     flex: 1,
//     padding: 20,
//   },
//   resultImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   nutritionSummary: {
//     backgroundColor: "#f0fdf4",
//     padding: 20,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   caloriesText: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#15803d",
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   macroRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   macroText: {
//     fontSize: 14,
//     color: "#166534",
//     fontWeight: "500",
//   },
//   foodItemsSection: {
//     marginBottom: 20,
//   },
//   sectionHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1f2937",
//   },
//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f0fdf4",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     gap: 4,
//   },
//   addButtonText: {
//     color: "#10B981",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   foodItemCard: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   foodItemHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   foodItemName: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1f2937",
//     borderBottomWidth: 1,
//     borderBottomColor: "transparent",
//     paddingVertical: 4,
//   },
//   editing: {
//     borderBottomColor: "#10B981",
//   },
//   removeButton: {
//     padding: 4,
//   },
//   foodItemDetails: {
//     gap: 12,
//   },
//   detailRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: "#6b7280",
//     fontWeight: "500",
//   },
//   detailInput: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     fontSize: 14,
//     minWidth: 80,
//     textAlign: "right",
//   },
//   macroInputs: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   macroInput: {
//     flex: 1,
//     alignItems: "center",
//   },
//   macroLabel: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginBottom: 4,
//   },
//   macroValue: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     fontSize: 14,
//     textAlign: "center",
//     width: "100%",
//   },
//   confidenceRow: {
//     alignItems: "center",
//   },
//   confidenceText: {
//     fontSize: 12,
//     color: "#10B981",
//     fontWeight: "500",
//   },
//   mealTypeContainer: {
//     marginBottom: 20,
//   },
//   mealTypeButtons: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   mealTypeButton: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     alignItems: "center",
//   },
//   mealTypeButtonActive: {
//     backgroundColor: "#10B981",
//     borderColor: "#10B981",
//   },
//   mealTypeButtonText: {
//     fontSize: 14,
//     color: "#6b7280",
//     fontWeight: "500",
//   },
//   mealTypeButtonTextActive: {
//     color: "white",
//   },
//   notesContainer: {
//     marginBottom: 20,
//   },
//   notesInput: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     textAlignVertical: "top",
//     minHeight: 80,
//   },
//   modalActions: {
//     flexDirection: "row",
//     gap: 12,
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//   },
//   webWarning: {
//     backgroundColor: "#fef3c7",
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#f59e0b",
//     marginBottom: 16,
//   },
//   webWarningText: {
//     color: "#92400e",
//     fontSize: 14,
//     textAlign: "center",
//     fontWeight: "500",
// });
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Service imports

// Direct camera imports
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";

// Type definitions
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  weight: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
}

export default function CameraTab() {
  const params = useLocalSearchParams<{ pastEntryTimestamp?: string }>();
  const pastEntryTimestamp = params.pastEntryTimestamp
    ? parseInt(params.pastEntryTimestamp)
    : null;

  // State variables
  const [facing, setFacing] = useState<CameraType>("back");
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // --- YOUR PROVEN takePicture FUNCTION ---
  // Using the exact logic that worked for you, which avoids the lifecycle race condition.
  const takePicture = async () => {
    if (analyzing || !cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      router.push({
        pathname: "/identify",
        params: {
          imageUri: photo.uri,
          base64: photo.base64 || "",
          // Pass the past entry timestamp if it exists
          pastEntryTimestamp: pastEntryTimestamp?.toString() || "",
        },
      });

      setShowCamera(false);
      setCapturedImage(null);
      setAnalyzing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to take picture. Please try again.");
      console.error("Camera error:", error);
      setAnalyzing(false);
    }
  };

  const pickImage = async () => {
    if (analyzing) return;
    try {
      setAnalyzing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        router.push({
          pathname: "/identify",
          params: {
            imageUri: asset.uri,
            base64: asset.base64 || "",
            // Pass the past entry timestamp if it exists
            pastEntryTimestamp: pastEntryTimestamp?.toString() || "",
          },
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error("Image picker error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCameraFacing = useCallback(
    () => setFacing((current) => (current === "back" ? "front" : "back")),
    []
  );
  const handleCloseCamera = useCallback(() => setShowCamera(false), []);
  const handleOpenCamera = useCallback(() => setShowCamera(true), []);

  if (Platform.OS !== "web" && !permission) {
    return <View style={styles.container} />;
  }

  if (Platform.OS !== "web" && !permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={64} color="#d1d5db" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need your camera to analyze food photos.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCamera && Platform.OS !== "web") {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
          mode="picture"
        />
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCloseCamera}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={analyzing}>
            {analyzing ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="restaurant" size={32} color="#10B981" />
          <Text style={styles.title}>Food Analysis</Text>
          <Text style={styles.subtitle}>
            Capture or select a photo for nutrition info
          </Text>
        </View>

        {analyzing ? (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.analyzingText}>Processing image...</Text>
            <Text style={styles.analyzingSubtext}>
              Getting ready for analysis
            </Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                analyzing && styles.actionButtonDisabled,
              ]}
              onPress={handleOpenCamera}
              disabled={analyzing}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.secondaryButton,
                analyzing && styles.secondaryButtonDisabled,
              ]}
              onPress={pickImage}
              disabled={analyzing}>
              <Ionicons name="image" size={24} color="#10B981" />
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!analyzing && (
          <>
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What we can analyze:</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="flash" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Calories & Macros</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="scale" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Portion Sizes</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="restaurant" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Food Identification</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="barbell" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Nutritional Breakdown</Text>
                </View>
              </View>
            </View>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>📸 Tips for better results:</Text>
              <Text style={styles.tipText}>• Use good, direct lighting</Text>
              <Text style={styles.tipText}>
                • Capture the entire meal in the frame
              </Text>
              <Text style={styles.tipText}>• Avoid blurry photos</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Base & Layout Styles
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },

  // Action Button Styles
  actionButtons: { gap: 16, marginBottom: 40 },
  actionButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  secondaryButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  secondaryButtonText: { color: "#10B981" },

  // Analyzing Indicator Styles
  analyzingContainer: { alignItems: "center", padding: 40 },
  analyzingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },

  // Camera UI Styles
  cameraContainer: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  cameraControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10B981",
  },

  // Permission Screen Styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },

  // Added UI Element Styles
  featuresContainer: { marginBottom: 40 },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  featuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  featureText: { fontSize: 16, color: "#1f2937", marginLeft: 8 },
  tipsContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 12,
  },
  tipText: { fontSize: 14, color: "#065f46", lineHeight: 22, marginBottom: 8 },
});
