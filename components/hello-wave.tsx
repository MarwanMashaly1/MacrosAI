import { StyleSheet, Text } from "react-native";

export function HelloWave() {
  return <Text style={styles.text}>👋</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
