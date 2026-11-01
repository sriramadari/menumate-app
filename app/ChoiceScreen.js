import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { supabase } from "../lib/supabase";

export default function ChoiceScreen() {
  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        What would you like to do?
      </Text>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => router.push("/merchant")}
      >
        I'm a merchant
      </Button>

      <Button mode="outlined" style={styles.button} onPress={signOut}>
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "black",
  },
  header: {
    color: "white",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    marginVertical: 8,
  },
});
