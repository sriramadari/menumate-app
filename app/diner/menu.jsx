import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Badge,
  Button,
  Chip,
  Divider,
  IconButton,
  Text,
} from "react-native-paper";
import { useCart } from "../../lib/cart";
import { formatPrice, getMenu, getRestaurant } from "../../lib/store";
import { useStoreData } from "../../lib/useStoreData";

export default function DinerMenu() {
  const { table, add, remove, qtyOf, count, total } = useCart();

  const load = useCallback(async () => {
    if (!table) return null;
    const [restaurant, menu] = await Promise.all([
      getRestaurant(table.restaurantId),
      getMenu(table.restaurantId),
    ]);
    return { restaurant, menu };
  }, [table]);

  const { data, loading } = useStoreData(load);

  // Group by category so the menu reads like a real one.
  const sections = useMemo(() => {
    const menu = (data?.menu ?? []).filter((m) => m.available);
    const byCategory = new Map();
    for (const item of menu) {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    }
    return [...byCategory.entries()];
  }, [data]);

  if (!table) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>
          No table open. Scan a table QR code to begin.
        </Text>
        <Button mode="contained" onPress={() => router.replace("/diner")}>
          Scan a table
        </Button>
      </View>
    );
  }

  if (loading || !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffb86b" size="large" />
      </View>
    );
  }

  // Flatten the grouped menu into rows FlatList can render.
  const rows = sections.flatMap(([category, items]) => [
    { type: "header", id: `h_${category}`, category },
    ...items.map((item) => ({ type: "item", id: item.id, item })),
  ]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.name}>
          {data.restaurant ? `${data.restaurant.emoji}  ${data.restaurant.name}` : "Menu"}
        </Text>
        <Chip compact style={styles.tableChip} textStyle={styles.tableChipText}>
          {table.tableLabel}
        </Chip>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        // Quantities live in the cart, not in `rows` -- without this the
        // steppers wouldn't repaint when the cart changes.
        extraData={count}
        contentContainerStyle={styles.list}
        renderItem={({ item: row }) => {
          if (row.type === "header") {
            return (
              <Text variant="titleSmall" style={styles.category}>
                {row.category}
              </Text>
            );
          }

          const item = row.item;
          const qty = qtyOf(item.id);

          return (
            <View>
              <View style={styles.row}>
                <View style={styles.rowMain}>
                  <Text variant="titleMedium" style={styles.itemName}>
                    {`${item.veg ? "🟢" : "🔴"}  ${item.name}`}
                  </Text>
                  {item.description ? (
                    <Text variant="bodySmall" style={styles.desc}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text variant="bodyMedium" style={styles.price}>
                    {formatPrice(item.price)}
                  </Text>
                </View>

                {qty === 0 ? (
                  <Button mode="outlined" compact onPress={() => add(item)}>
                    Add
                  </Button>
                ) : (
                  <View style={styles.stepper}>
                    <IconButton icon="minus" size={18} onPress={() => remove(item.id)} />
                    <Text style={styles.qty}>{qty}</Text>
                    <IconButton icon="plus" size={18} onPress={() => add(item)} />
                  </View>
                )}
              </View>
              <Divider style={styles.divider} />
            </View>
          );
        }}
      />

      {count > 0 ? (
        <View style={styles.bar}>
          <View>
            <Text style={styles.barTotal}>{formatPrice(total)}</Text>
            <Text style={styles.barCount}>
              {`${count} item${count === 1 ? "" : "s"}`}
            </Text>
          </View>
          <View>
            <Button mode="contained" onPress={() => router.push("/diner/cart")}>
              Review order
            </Button>
            <Badge style={styles.badge}>{count}</Badge>
          </View>
        </View>
      ) : null}
    </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 8,
  },
  name: { color: "#fff", flex: 1 },
  tableChip: { backgroundColor: "#2a2a2a" },
  tableChipText: { color: "#ffb86b", fontSize: 11 },
  list: { paddingHorizontal: 16, paddingBottom: 110 },
  category: {
    color: "#ffb86b",
    marginTop: 18,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowMain: { flex: 1, paddingRight: 10 },
  itemName: { color: "#fff" },
  desc: { color: "#8f8f8f", marginTop: 2 },
  price: { color: "#dcdcdc", marginTop: 4 },
  divider: { backgroundColor: "#1a1a1a" },
  stepper: { flexDirection: "row", alignItems: "center" },
  qty: { color: "#fff", minWidth: 18, textAlign: "center" },
  empty: { color: "#9a9a9a", textAlign: "center", marginBottom: 20 },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#141414",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#242424",
  },
  barTotal: { color: "#fff", fontSize: 18, fontWeight: "600" },
  barCount: { color: "#8f8f8f", fontSize: 12 },
  badge: { position: "absolute", top: -6, right: -6, backgroundColor: "#ffb86b", color: "#2a1600" },
});
