import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { AUTH_MODE, signOut } from "../lib/auth";

export default function ChoiceScreen() {
  const [busy, setBusy] = useState(false);

  async function onSignOut() {
    setBusy(true);
    try {
      await signOut();
      router.replace("/");
    } catch {
      // Even a failed sign-out should return the user to the login screen.
      router.replace("/");
    } finally {
      setBusy(false);
    }
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

      <Button
        mode="outlined"
        style={styles.button}
        onPress={onSignOut}
        loading={busy}
        disabled={busy}
      >
        Sign out
      </Button>

      <Text variant="bodySmall" style={styles.mode}>
        {`auth mode: ${AUTH_MODE}`}
      </Text>
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
  mode: {
    color: "#777777",
    textAlign: "center",
    marginTop: 24,
  },
});
