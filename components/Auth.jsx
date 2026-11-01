import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { useAutoRefresh } from "../lib/useAutoRefresh";

export default function Auth({ phone, setPhone, setSentCode }) {
	const [loading, setLoading] = useState(false);
	useAutoRefresh();

	async function signInWithPhone() {
		if (!phone) return;
		setLoading(true);

		const { error } = await supabase.auth.signInWithOtp({
			phone: `91${phone}`,
		});

		setLoading(false);
		if (error) Alert.alert(error.message);
		else setSentCode(true);
	}

	return (
		<View style={styles.container}>
			<Text variant="headlineMedium" style={styles.header}>
				Welcome to MenuMate
			</Text>
			<View style={styles.verticallySpaced}>
				<TextInput
					mode="outlined"
					label="Phone Number 🤳"
					placeholder="Enter your phone number"
					value={phone}
					keyboardType="phone-pad"
					autoComplete="tel"
					onChangeText={setPhone}
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<Button
					mode="contained"
					onPress={signInWithPhone}
					loading={loading}
					disabled={loading || !phone}
				>
					Sign In
				</Button>
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
		paddingTop: 8,
		paddingBottom: 8,
		alignSelf: "stretch",
	},
	header: {
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
		color: "white",
	},
});
