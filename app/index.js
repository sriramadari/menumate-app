import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Auth from "../components/Auth.jsx";
import OTPVerify from "../components/OTPVerify.jsx";
import { getSession, onAuthStateChange } from "../lib/auth";

export default function Index() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [phone, setPhone] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [devCode, setDevCode] = useState(null);

  useEffect(() => {
    let active = true;

    getSession()
      .then((s) => {
        if (active) setSession(s);
      })
      .catch(() => {
        // Treat an unreadable session as "signed out" rather than crashing.
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setLoadingSession(false);
      });

    const unsubscribe = onAuthStateChange((s) => {
      if (active) setSession(s);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loadingSession) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (session?.user) {
    return <Redirect href="/ChoiceScreen" />;
  }

  return (
    <View style={styles.container}>
      {sentCode ? (
        <OTPVerify phone={phone} devCode={devCode} />
      ) : (
        <Auth
          phone={phone}
          setPhone={setPhone}
          setSentCode={setSentCode}
          setDevCode={setDevCode}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: "40%",
    backgroundColor: "black",
  },
  centered: {
    alignItems: "center",
    paddingBottom: 0,
  },
});
