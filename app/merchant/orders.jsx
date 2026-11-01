import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Text } from "react-native-paper";
import { MY_RESTAURANT_ID } from "../../lib/seed";
import {
  ORDER_STATUS_LABELS,
  advanceOrder,
  formatPrice,
  getOrders,
  nextStatus,
} from "../../lib/store";
import { useStoreData } from "../../lib/useStoreData";

export default function MerchantOrders() {
  const load = useCallback(() => getOrders({ restaurantId: MY_RESTAURANT_ID }), []);
  const { data: orders, loading } = useStoreData(load, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffb86b" size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={orders}
      keyExtractor={(o) => o.id}
      ListEmptyComponent={
        <Text style={styles.empty}>
          No orders yet. Place one from the Dine out side to see it appear here.
        </Text>
      }
      renderItem={({ item }) => {
        const next = nextStatus(item.status);

        return (
          <Card style={styles.card} mode="elevated">
            <Card.Title
              title={item.tableLabel}
              subtitle={`${formatPrice(item.total)} · ${timeAgo(item.createdAt)}`}
              right={() => (
                <Chip compact style={styles.chip} textStyle={styles.chipText}>
                  {ORDER_STATUS_LABELS[item.status]}
                </Chip>
              )}
            />
            <Card.Content>
              {item.items.map((line) => (
                <View key={line.itemId} style={styles.line}>
                  <Text style={styles.lineName}>
                    {`${line.qty} × ${line.name}`}
                  </Text>
                  <Text style={styles.linePrice}>
                    {formatPrice(line.price * line.qty)}
                  </Text>
                </View>
              ))}
            </Card.Content>
            {next ? (
              <Card.Actions>
                <Button mode="contained" onPress={() => advanceOrder(item.id)}>
                  {`Mark ${ORDER_STATUS_LABELS[next].toLowerCase()}`}
                </Button>
              </Card.Actions>
            ) : null}
          </Card>
        );
      }}
    />
  );
}

function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  list: { padding: 12, paddingBottom: 32 },
  card: { marginBottom: 12 },
  chip: { backgroundColor: "#2a2a2a", marginRight: 12 },
  chipText: { color: "#ffb86b", fontSize: 11 },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  lineName: { color: "#dcdcdc" },
  linePrice: { color: "#9a9a9a" },
  empty: { color: "#8f8f8f", textAlign: "center", marginTop: 48, paddingHorizontal: 24 },
});
