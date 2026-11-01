import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Dialog, Portal, Text } from "react-native-paper";
import { AUTH_MODE, signOut } from "../lib/auth";
import { resetDemoData } from "../lib/store";

export default function ChoiceScreen() {
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  async function onSignOut() {
    setBusy(true);
    try {
      await signOut();
    } finally {
      // Return to login whether or not sign-out succeeded.
      router.replace("/");
    }
  }

  async function onReset() {
    setConfirmReset(false);
    await resetDemoData();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        What are you here for?
      </Text>

      <Card style={styles.card} mode="elevated" onPress={() => router.push("/diner")}>
        <Card.Title
          title="Dine out"
          titleVariant="titleLarge"
          subtitle="Scan a table QR and order"
          left={(p) => <Text {...p} style={styles.emoji}>🍽️</Text>}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.body}>
            Point your camera at the QR on the table, browse the menu and place
            an order.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated" onPress={() => router.push("/merchant")}>
        <Card.Title
          title="I'm a merchant"
          titleVariant="titleLarge"
          subtitle="Manage menu, tables and orders"
          left={(p) => <Text {...p} style={styles.emoji}>🧑‍🍳</Text>}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.body}>
            Edit your menu, print table QR codes and move live orders through
            the kitchen.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Button mode="text" onPress={() => setConfirmReset(true)}>
          Reset demo data
        </Button>
        <Button mode="text" onPress={onSignOut} loading={busy} disabled={busy}>
          Sign out
        </Button>
        <Text variant="bodySmall" style={styles.mode}>
          {`offline demo · auth mode: ${AUTH_MODE}`}
        </Text>
      </View>

      <Portal>
        <Dialog visible={confirmReset} onDismiss={() => setConfirmReset(false)}>
          <Dialog.Title>Reset demo data?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Restores the sample restaurants, menus and orders. Anything you
              added or changed is discarded.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmReset(false)}>Cancel</Button>
            <Button onPress={onReset}>Reset</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: "#fff", marginTop: 8, marginBottom: 20 },
  card: { marginBottom: 16 },
  emoji: { fontSize: 32 },
  body: { color: "#bdbdbd", paddingBottom: 8 },
  footer: { marginTop: 8, alignItems: "center" },
  mode: { color: "#6f6f6f", marginTop: 12 },
});
