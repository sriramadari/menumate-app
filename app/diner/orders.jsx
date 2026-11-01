import { router } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  ProgressBar,
  Text,
} from "react-native-paper";
import { getSession } from "../../lib/auth";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatPrice,
  getOrders,
} from "../../lib/store";
import { useStoreData } from "../../lib/useStoreData";

export default function DinerOrders() {
  // Only this diner's orders -- the merchant screen is where the whole
  // restaurant's queue is shown.
  const load = useCallback(async () => {
    const session = await getSession().catch(() => null);
    const phone = session?.user?.phone;
    return phone ? getOrders({ placedBy: phone }) : [];
  }, []);

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
        <View style={styles.centered}>
          <Text style={styles.empty}>You haven't ordered anything yet.</Text>
          <Button mode="contained" onPress={() => router.replace("/diner")}>
            Scan a table
          </Button>
        </View>
      }
      renderItem={({ item }) => {
        const step = ORDER_STATUSES.indexOf(item.status);
        const progress = (step + 1) / ORDER_STATUSES.length;

        return (
          <Card style={styles.card} mode="elevated">
            <Card.Title
              title={item.tableLabel}
              subtitle={formatPrice(item.total)}
              right={() => (
                <Chip compact style={styles.chip} textStyle={styles.chipText}>
                  {ORDER_STATUS_LABELS[item.status]}
                </Chip>
              )}
            />
            <Card.Content>
              <ProgressBar
                progress={progress}
                color="#ffb86b"
                style={styles.progress}
              />
              <Text variant="bodySmall" style={styles.steps}>
                {ORDER_STATUSES.map((s) => ORDER_STATUS_LABELS[s]).join(" → ")}
              </Text>

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
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
  },
  list: { padding: 12, paddingBottom: 32 },
  card: { marginBottom: 12 },
  chip: { backgroundColor: "#2a2a2a", marginRight: 12 },
  chipText: { color: "#ffb86b", fontSize: 11 },
  progress: { height: 6, borderRadius: 3, backgroundColor: "#242424" },
  steps: { color: "#6f6f6f", marginTop: 8, marginBottom: 10, fontSize: 10 },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  lineName: { color: "#dcdcdc" },
  linePrice: { color: "#9a9a9a" },
  empty: { color: "#9a9a9a", marginBottom: 20, textAlign: "center" },
});
