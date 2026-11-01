import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { useCart } from "../../lib/cart";
import { parseTableQr } from "../../lib/qr";
import { getRestaurants, getTable, getTables } from "../../lib/store";
import { useStoreData } from "../../lib/useStoreData";

export default function DinerEntry() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [error, setError] = useState(null);
  const { openTable } = useCart();

  // onBarcodeScanned fires continuously while a code is in frame, so latch
  // to make sure we only act on the first hit.
  const handled = useRef(false);

  const load = useCallback(async () => {
    const [restaurants, tables] = await Promise.all([
      getRestaurants(),
      getTables(),
    ]);
    return { restaurants, tables };
  }, []);
  const { data } = useStoreData(load);

  const openCode = useCallback(
    async (code) => {
      const parsed = parseTableQr(code);
      if (!parsed) {
        setError("That isn't a MenuMate table code.");
        return false;
      }

      const table = await getTable(parsed.tableId);
      if (!table || table.restaurantId !== parsed.restaurantId) {
        setError("That table no longer exists.");
        return false;
      }

      openTable({
        restaurantId: parsed.restaurantId,
        tableId: table.id,
        tableLabel: table.label,
      });
      setError(null);
      router.push("/diner/menu");
      return true;
    },
    [openTable]
  );

  async function onScanned({ data: code }) {
    if (handled.current) return;
    handled.current = true;

    await openCode(code);
    setScanning(false);

    // Let the user try again if that code wasn't usable.
    setTimeout(() => {
      handled.current = false;
    }, 800);
  }

  async function startScan() {
    setError(null);

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError(
          "Camera access is needed to scan. You can type the code instead."
        );
        return;
      }
    }

    handled.current = false;
    setScanning(true);
  }

  if (scanning) {
    return (
      <View style={styles.scanner}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onScanned}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.reticle} />
          <Text style={styles.scanHint}>Point at the QR code on your table</Text>
          <Button mode="contained" onPress={() => setScanning(false)}>
            Cancel
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        Scan your table
      </Text>
      <Text variant="bodyMedium" style={styles.intro}>
        Every table has its own QR code, so your order reaches the right place.
      </Text>

      <Button mode="contained" style={styles.scanBtn} onPress={startScan}>
        Open camera
      </Button>

      <HelperText type="error" visible={Boolean(error)}>
        {error ?? " "}
      </HelperText>

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Or enter the code
      </Text>
      <TextInput
        mode="outlined"
        label="Table code"
        placeholder="MENUMATE:r1:t2"
        autoCapitalize="none"
        value={manual}
        onChangeText={setManual}
      />
      <Button
        mode="outlined"
        style={styles.manualBtn}
        disabled={!manual.trim()}
        onPress={() => openCode(manual)}
      >
        Open menu
      </Button>

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Or walk in to a demo table
      </Text>
      {(data?.restaurants ?? []).map((r) => {
        const table = (data?.tables ?? []).find((t) => t.restaurantId === r.id);
        if (!table) return null;

        return (
          <Card
            key={r.id}
            style={styles.card}
            mode="elevated"
            onPress={() => {
              openTable({
                restaurantId: r.id,
                tableId: table.id,
                tableLabel: table.label,
              });
              router.push("/diner/menu");
            }}
          >
            <Card.Title
              title={`${r.emoji}  ${r.name}`}
              subtitle={`${r.cuisine} · ${r.area} · ★ ${r.rating}`}
            />
          </Card>
        );
      })}

      <Button
        mode="text"
        style={styles.ordersBtn}
        onPress={() => router.push("/diner/orders")}
      >
        View my orders
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: "#fff" },
  intro: { color: "#9a9a9a", marginTop: 6, marginBottom: 18 },
  scanBtn: { marginBottom: 4 },
  divider: { backgroundColor: "#1f1f1f", marginVertical: 18 },
  sectionTitle: { color: "#cfcfcf", marginBottom: 10 },
  manualBtn: { marginTop: 10 },
  card: { marginBottom: 10 },
  ordersBtn: { marginTop: 18 },

  scanner: { flex: 1, backgroundColor: "#000" },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  reticle: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: "#ffb86b",
    borderRadius: 16,
    marginBottom: 24,
  },
  scanHint: { color: "#fff", marginBottom: 24, textAlign: "center" },
});
