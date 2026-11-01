import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Dialog,
  Divider,
  FAB,
  HelperText,
  IconButton,
  Portal,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { MY_RESTAURANT_ID } from "../../lib/seed";
import {
  addMenuItem,
  deleteMenuItem,
  formatPrice,
  getMenu,
  toggleMenuItemAvailability,
  updateMenuItem,
} from "../../lib/store";
import { useStoreData } from "../../lib/useStoreData";

const EMPTY_DRAFT = {
  name: "",
  description: "",
  price: "",
  category: "Mains",
  veg: true,
};

export default function MerchantMenu() {
  const load = useCallback(() => getMenu(MY_RESTAURANT_ID), []);
  const { data: menu, loading } = useStoreData(load, []);

  const [editing, setEditing] = useState(null); // item id, or "new"
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState(null);

  function openNew() {
    setDraft(EMPTY_DRAFT);
    setError(null);
    setEditing("new");
  }

  function openEdit(item) {
    setDraft({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category: item.category ?? "Mains",
      veg: Boolean(item.veg),
    });
    setError(null);
    setEditing(item.id);
  }

  async function save() {
    const name = draft.name.trim();
    const price = Number(draft.price);

    if (!name) return setError("Give the dish a name.");
    if (!Number.isFinite(price) || price <= 0)
      return setError("Enter a price greater than zero.");

    const payload = {
      name,
      description: draft.description.trim(),
      price,
      category: draft.category.trim() || "Mains",
      veg: draft.veg,
    };

    try {
      if (editing === "new") {
        await addMenuItem({ ...payload, restaurantId: MY_RESTAURANT_ID });
      } else {
        await updateMenuItem(editing, payload);
      }
      setEditing(null);
    } catch (e) {
      setError(e?.message ?? "Could not save the item.");
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffb86b" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={menu}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No dishes yet. Tap + to add your first one.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowMain}>
              <Text variant="titleMedium" style={styles.name}>
                {`${item.veg ? "🟢" : "🔴"}  ${item.name}`}
              </Text>
              {item.description ? (
                <Text variant="bodySmall" style={styles.desc}>
                  {item.description}
                </Text>
              ) : null}
              <Text variant="bodyMedium" style={styles.price}>
                {`${formatPrice(item.price)} · ${item.category}`}
                {item.available ? "" : " · sold out"}
              </Text>
            </View>

            <View style={styles.rowActions}>
              <Switch
                value={item.available}
                onValueChange={() => toggleMenuItemAvailability(item.id)}
              />
              <IconButton icon="pencil" onPress={() => openEdit(item)} />
              <IconButton icon="delete" onPress={() => deleteMenuItem(item.id)} />
            </View>
          </View>
        )}
      />

      <FAB icon="plus" style={styles.fab} onPress={openNew} />

      <Portal>
        <Dialog visible={editing !== null} onDismiss={() => setEditing(null)}>
          <Dialog.Title>
            {editing === "new" ? "Add a dish" : "Edit dish"}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Name"
              value={draft.name}
              onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
              style={styles.field}
            />
            <TextInput
              mode="outlined"
              label="Description"
              value={draft.description}
              onChangeText={(description) =>
                setDraft((d) => ({ ...d, description }))
              }
              style={styles.field}
            />
            <TextInput
              mode="outlined"
              label="Price (₹)"
              value={draft.price}
              keyboardType="number-pad"
              onChangeText={(price) =>
                setDraft((d) => ({ ...d, price: price.replace(/\D/g, "") }))
              }
              style={styles.field}
            />
            <TextInput
              mode="outlined"
              label="Category"
              value={draft.category}
              onChangeText={(category) => setDraft((d) => ({ ...d, category }))}
              style={styles.field}
            />
            <View style={styles.vegRow}>
              <Text variant="bodyMedium" style={styles.vegLabel}>
                Vegetarian
              </Text>
              <Switch
                value={draft.veg}
                onValueChange={(veg) => setDraft((d) => ({ ...d, veg }))}
              />
            </View>
            <HelperText type="error" visible={Boolean(error)}>
              {error ?? " "}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditing(null)}>Cancel</Button>
            <Button onPress={save}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  list: { padding: 12, paddingBottom: 96 },
  divider: { backgroundColor: "#1f1f1f" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowMain: { flex: 1, paddingRight: 8 },
  rowActions: { flexDirection: "row", alignItems: "center" },
  name: { color: "#fff" },
  desc: { color: "#8f8f8f", marginTop: 2 },
  price: { color: "#ffb86b", marginTop: 4 },
  empty: { color: "#8f8f8f", textAlign: "center", marginTop: 40 },
  fab: { position: "absolute", right: 16, bottom: 24, backgroundColor: "#ffb86b" },
  field: { marginBottom: 10 },
  vegRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  vegLabel: { color: "#dcdcdc" },
});
