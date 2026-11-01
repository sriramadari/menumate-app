import { router } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, Text } from "react-native-paper";
import { MY_RESTAURANT_ID } from "../../lib/seed";
import {
  ORDER_STATUS_LABELS,
  formatPrice,
  getMenu,
  getOrders,
  getRestaurant,
  getTables,
} from "../../lib/store";
import { useStoreData } from "../../lib/useStoreData";

export default function MerchantDashboard() {
  const load = useCallback(async () => {
    const [restaurant, menu, tables, orders] = await Promise.all([
      getRestaurant(MY_RESTAURANT_ID),
      getMenu(MY_RESTAURANT_ID),
      getTables(MY_RESTAURANT_ID),
      getOrders({ restaurantId: MY_RESTAURANT_ID }),
    ]);
    return { restaurant, menu, tables, orders };
  }, []);

  const { data, loading } = useStoreData(load);

  if (loading || !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffb86b" size="large" />
      </View>
    );
  }

  const { restaurant, menu, tables, orders } = data;
  const openOrders = orders.filter((o) => o.status !== "served");
  const revenue = orders
    .filter((o) => o.status === "served")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        {restaurant ? `${restaurant.emoji}  ${restaurant.name}` : "Your restaurant"}
      </Text>
      {restaurant ? (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {`${restaurant.cuisine} · ${restaurant.area}`}
        </Text>
      ) : null}

      <View style={styles.statRow}>
        <Stat label="Open orders" value={String(openOrders.length)} />
        <Stat label="Menu items" value={String(menu.length)} />
        <Stat label="Served today" value={formatPrice(revenue)} />
      </View>

      <Card style={styles.card} mode="elevated" onPress={() => router.push("/merchant/orders")}>
        <Card.Title title="Live orders" subtitle={`${openOrders.length} waiting`} />
        <Card.Content>
          {openOrders.length === 0 ? (
            <Text style={styles.muted}>Nothing in the queue right now.</Text>
          ) : (
            openOrders.slice(0, 3).map((o) => (
              <View key={o.id} style={styles.orderRow}>
                <Text style={styles.orderText}>
                  {`${o.tableLabel} · ${formatPrice(o.total)}`}
                </Text>
                <Chip compact style={styles.chip} textStyle={styles.chipText}>
                  {ORDER_STATUS_LABELS[o.status]}
                </Chip>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated" onPress={() => router.push("/merchant/menu")}>
        <Card.Title title="Menu" subtitle={`${menu.length} items`} />
        <Card.Content>
          <Text style={styles.muted}>
            Add dishes, change prices, mark things sold out.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated" onPress={() => router.push("/merchant/tables")}>
        <Card.Title title="Table QR codes" subtitle={`${tables.length} tables`} />
        <Card.Content>
          <Text style={styles.muted}>
            Show a code at the table for diners to scan.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text variant="titleLarge" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: "#fff" },
  subtitle: { color: "#9a9a9a", marginBottom: 20 },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: "#141414", borderRadius: 12, padding: 12 },
  statValue: { color: "#ffb86b" },
  statLabel: { color: "#8a8a8a", marginTop: 2 },
  card: { marginBottom: 14 },
  muted: { color: "#9a9a9a" },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  orderText: { color: "#dcdcdc" },
  chip: { backgroundColor: "#2a2a2a" },
  chipText: { color: "#ffb86b", fontSize: 11 },
});
