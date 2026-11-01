import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";
import "react-native-url-polyfill/auto";
import { CartProvider } from "../lib/cart";
import { initStore } from "../lib/store";

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#ffb86b",
    onPrimary: "#2a1600",
    background: "#000000",
    surface: "#0e0e0e",
    surfaceVariant: "#1b1b1b",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: "#141414",
      level2: "#191919",
    },
  },
};

/**
 * Paper resolves icons through react-native-vector-icons by default, which
 * an Expo project doesn't have -- point it at @expo/vector-icons instead.
 */
const settings = {
  icon: (props) => <MaterialCommunityIcons {...props} />,
};

export default function RootLayout() {
  useEffect(() => {
    // Seeds the sample data once; a no-op on later launches.
    initStore().catch(() => {
      // A seeding failure shouldn't block the app -- screens render empty.
    });
  }, []);

  return (
    <PaperProvider theme={theme} settings={settings}>
      <CartProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#0e0e0e" },
            headerTintColor: "#ffffff",
            contentStyle: { backgroundColor: "#000000" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="ChoiceScreen" options={{ title: "MenuMate" }} />

          <Stack.Screen name="merchant/index" options={{ title: "Merchant" }} />
          <Stack.Screen name="merchant/menu" options={{ title: "Menu" }} />
          <Stack.Screen name="merchant/tables" options={{ title: "Table QR codes" }} />
          <Stack.Screen name="merchant/orders" options={{ title: "Live orders" }} />

          <Stack.Screen name="diner/index" options={{ title: "Dine out" }} />
          <Stack.Screen name="diner/menu" options={{ title: "Menu" }} />
          <Stack.Screen name="diner/cart" options={{ title: "Your order" }} />
          <Stack.Screen name="diner/orders" options={{ title: "Your orders" }} />
        </Stack>
      </CartProvider>
    </PaperProvider>
  );
}
