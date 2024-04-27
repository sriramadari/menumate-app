import React, { useState } from "react";
import { Alert, AppState, StyleSheet, Text, View } from "react-native";
import { Button, Input } from "react-native-elements";
import { supabase } from "../lib/supabase";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});

export default function Auth({ phone, setPhone, setSentCode }) {
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);

	async function signInWithPhone() {
		// undo this
		// router.push("/ChoiceScreen");
		// return;
		setLoading(true);
		const { data, error } = await supabase.auth.signInWithOtp({
			phone: `91${phone}`,
		});

		if (error) Alert.alert(error.message);
		else {
			setLoading(false);
			setSentCode(true);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Welcome to MenuMate</Text>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Input
					label="Phone Number 🤳"
					labelStyle={{ color: "white", fontSize: 26}}
					placeholder="Enter your phone number"
					placeholderTextColor="grey"
					inputStyle={{ color: "white", fontSize:16}}
					leftIcon={{ type: "font-awesome", name: "phone", color: "white"}}
					value={phone}
					keyboardType="phone-pad"
					onChangeText={setPhone}
				/>
			</View>
			<View style={[styles.verticallySpaced, styles.mt20]}>
    <Button
        title="Sign In"
        onPress={signInWithPhone}
        disabled={loading}
    />
</View>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		marginTop: 40,
		padding: 12,
	},
	verticallySpaced: {
		paddingTop: 4,
		paddingBottom: 4,
		alignSelf: "stretch",
	},
	mt20: {
		
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
		color: "white",
		
	},
});
