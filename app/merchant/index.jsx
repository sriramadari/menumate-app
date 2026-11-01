import { ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function Merchant() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Merchant dashboard
      </Text>
      <Text style={styles.body}>
        Menu and QR management will live here.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    padding: 20,
  },
  header: {
    color: "white",
    marginBottom: 12,
  },
  body: {
    color: "#bbbbbb",
  },
});
