import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  HelperText,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { buildTableQr } from "../../lib/qr";
import { MY_RESTAURANT_ID } from "../../lib/seed";
import { addTable, getTables } from "../../lib/store";
import { useStoreData } from "../../lib/useStoreData";

export default function MerchantTables() {
  const load = useCallback(() => getTables(MY_RESTAURANT_ID), []);
  const { data: tables, loading } = useStoreData(load, []);

  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState(null);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffb86b" size="large" />
      </View>
    );
  }

  const selected =
    tables.find((t) => t.id === selectedId) ?? tables[0] ?? null;
  const payload = selected ? buildTableQr({ restaurantId: MY_RESTAURANT_ID, tableId: selected.id }) : null;

  async function save() {
    const name = label.trim();
    if (!name) return setError("Give the table a name.");

    try {
      const created = await addTable({
        restaurantId: MY_RESTAURANT_ID,
        label: name,
      });
      setSelectedId(created.id);
      setAdding(false);
      setLabel("");
      setError(null);
    } catch (e) {
      setError(e?.message ?? "Could not add the table.");
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text variant="bodyMedium" style={styles.intro}>
        Print or show a code at the table. A diner scans it to open your menu
        for that exact table.
      </Text>

      {tables.length > 0 ? (
        <SegmentedButtons
          value={selected?.id}
          onValueChange={setSelectedId}
          style={styles.segmented}
          buttons={tables.slice(0, 4).map((t) => ({
            value: t.id,
            label: t.label.replace("Table ", "T"),
          }))}
        />
      ) : null}

      {selected ? (
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.qrWrap}>
            <View style={styles.qrBox}>
              <QRCode value={payload} size={200} backgroundColor="#ffffff" color="#000000" />
            </View>
            <Text variant="titleMedium" style={styles.tableLabel}>
              {selected.label}
            </Text>
            <Text variant="bodySmall" style={styles.code} selectable>
              {payload}
            </Text>
            <Text variant="bodySmall" style={styles.hint}>
              No camera? That code can be typed in by hand on the Dine out
              screen.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <Text style={styles.empty}>No tables yet. Add one below.</Text>
      )}

      <Button mode="outlined" style={styles.add} onPress={() => setAdding(true)}>
        Add a table
      </Button>

      <Portal>
        <Dialog visible={adding} onDismiss={() => setAdding(false)}>
          <Dialog.Title>Add a table</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Label"
              placeholder="e.g. Table 5"
              value={label}
              onChangeText={setLabel}
            />
            <HelperText type="error" visible={Boolean(error)}>
              {error ?? " "}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAdding(false)}>Cancel</Button>
            <Button onPress={save}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  content: { padding: 16, paddingBottom: 40 },
  intro: { color: "#9a9a9a", marginBottom: 16 },
  segmented: { marginBottom: 16 },
  card: { marginBottom: 16 },
  qrWrap: { alignItems: "center", paddingVertical: 12 },
  qrBox: { padding: 14, backgroundColor: "#fff", borderRadius: 12 },
  tableLabel: { color: "#fff", marginTop: 16 },
  code: { color: "#ffb86b", marginTop: 6 },
  hint: { color: "#7a7a7a", marginTop: 12, textAlign: "center" },
  empty: { color: "#8f8f8f", textAlign: "center", marginVertical: 24 },
  add: { marginTop: 4 },
});
