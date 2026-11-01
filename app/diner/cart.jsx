import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  HelperText,
  IconButton,
  Text,
} from "react-native-paper";
import { getSession } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { formatPrice, placeOrder } from "../../lib/store";

export default function DinerCart() {
  const { table, lines, total, add, remove, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setPlacing(true);
    setError(null);

    try {
      // Stamp the order with the signed-in phone so "Your orders" shows
      // this diner's orders rather than the whole restaurant's.
      const session = await getSession().catch(() => null);

      await placeOrder({
        restaurantId: table.restaurantId,
        tableId: table.tableId,
        tableLabel: table.tableLabel,
        items: lines,
        placedBy: session?.user?.phone ?? null,
      });
      clear();
      router.replace("/diner/orders");
    } catch (e) {
      setError(e?.message ?? "Could not place the order.");
    } finally {
      setPlacing(false);
    }
  }

  if (!table || lines.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Your order is empty.</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Back to menu
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text variant="bodyMedium" style={styles.table}>
        {`Ordering for ${table.tableLabel}`}
      </Text>

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          {lines.map((line, index) => (
            <View key={line.itemId}>
              {index > 0 ? <Divider style={styles.divider} /> : null}
              <View style={styles.row}>
                <View style={styles.rowMain}>
                  <Text style={styles.name}>{line.name}</Text>
                  <Text style={styles.unit}>
                    {`${formatPrice(line.price)} each`}
                  </Text>
                </View>

                <View style={styles.stepper}>
                  <IconButton icon="minus" size={18} onPress={() => remove(line.itemId)} />
                  <Text style={styles.qty}>{line.qty}</Text>
                  <IconButton
                    icon="plus"
                    size={18}
                    onPress={() =>
                      add({ id: line.itemId, name: line.name, price: line.price })
                    }
                  />
                </View>

                <Text style={styles.lineTotal}>
                  {formatPrice(line.price * line.qty)}
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.totalRow}>
        <Text variant="titleMedium" style={styles.totalLabel}>
          Total
        </Text>
        <Text variant="titleMedium" style={styles.totalValue}>
          {formatPrice(total)}
        </Text>
      </View>

      <HelperText type="error" visible={Boolean(error)}>
        {error ?? " "}
      </HelperText>

      <Button
        mode="contained"
        onPress={submit}
        loading={placing}
        disabled={placing}
      >
        Place order
      </Button>
      <Button mode="text" style={styles.clear} onPress={clear} disabled={placing}>
        Clear order
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  content: { padding: 16, paddingBottom: 40 },
  table: { color: "#9a9a9a", marginBottom: 14 },
  card: { marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  rowMain: { flex: 1 },
  name: { color: "#fff" },
  unit: { color: "#8f8f8f", fontSize: 12, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center" },
  qty: { color: "#fff", minWidth: 18, textAlign: "center" },
  lineTotal: { color: "#dcdcdc", minWidth: 72, textAlign: "right" },
  divider: { backgroundColor: "#1f1f1f" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  totalLabel: { color: "#fff" },
  totalValue: { color: "#ffb86b" },
  empty: { color: "#9a9a9a", marginBottom: 20 },
  clear: { marginTop: 4 },
});
