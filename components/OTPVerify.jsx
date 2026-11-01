import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { useAutoRefresh } from "../lib/useAutoRefresh";

export default function OTPVerify({ phone }) {
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	useAutoRefresh();

	async function verifyOtp() {
		if (!otp) return;
		setLoading(true);

		const {
			data: { session },
			error: verifyError,
		} = await supabase.auth.verifyOtp({
			phone: `91${phone}`,
			token: otp,
			type: "sms",
		});

		if (verifyError) {
			setLoading(false);
			Alert.alert(verifyError.message);
			return;
		}

		const { data: profiles, error: profileError } = await supabase
			.from("user_profiles")
			.select("id")
			.eq("id", session.user.id);

		if (profileError) {
			setLoading(false);
			Alert.alert(profileError.message);
			return;
		}

		if (profiles.length === 0) {
			const { error: insertError } = await supabase
				.from("user_profiles")
				.insert([{ id: session.user.id }]);

			if (insertError) {
				setLoading(false);
				Alert.alert(insertError.message);
				return;
			}
		}

		setLoading(false);
		router.replace("/ChoiceScreen");
	}

	return (
		<View style={styles.container}>
			<Text variant="headlineMedium" style={styles.header}>
				Let's get you verified ✅
			</Text>
			<View style={styles.verticallySpaced}>
				<TextInput
					mode="outlined"
					label="OTP 🔐"
					placeholder="Enter your verification code"
					value={otp}
					keyboardType="number-pad"
					autoComplete="sms-otp"
					onChangeText={setOtp}
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<Button
					mode="contained"
					onPress={verifyOtp}
					loading={loading}
					disabled={loading || !otp}
				>
					Verify
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
