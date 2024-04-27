import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import "react-native-url-polyfill/auto";
import Auth from "../components/Auth.jsx";
import OTPVerify from "../components/OTPVerify.jsx";
import { supabase } from "../lib/supabase.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [phone, setPhone] = useState("");
  const [sentCode, setSentCode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

if (session && session.user) {
    console.log("WE IN HERE");
    return <Redirect href={"ChoiceScreen"} />;
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
    paddingBottom: '40%',
    backgroundColor: "black",
  },
  subheader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});
