import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";
import "react-native-url-polyfill/auto";

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: "#000000",
    surface: "#000000",
  },
};

/**
 * Paper renders icons through react-native-vector-icons by default, which
 * isn't present in an Expo project -- point it at @expo/vector-icons so
 * any component that draws an icon doesn't blow up at runtime.
 */
const settings = {
  icon: (props) => <MaterialCommunityIcons {...props} />,
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme} settings={settings}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#ffffff",
          contentStyle: { backgroundColor: "#000000" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="ChoiceScreen" options={{ title: "Choose" }} />
        <Stack.Screen name="merchant/index" options={{ title: "Merchant" }} />
      </Stack>
    </PaperProvider>
  );
}
