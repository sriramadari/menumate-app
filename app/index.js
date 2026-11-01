import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Auth from "../components/Auth.jsx";
import OTPVerify from "../components/OTPVerify.jsx";
import { supabase } from "../lib/supabase.js";

export default function Index() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [phone, setPhone] = useState("");
  const [sentCode, setSentCode] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session))
      .finally(() => setLoadingSession(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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
        <OTPVerify phone={phone} />
      ) : (
        <Auth phone={phone} setPhone={setPhone} setSentCode={setSentCode} />
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
