import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Banner, Button, HelperText, Text, TextInput } from "react-native-paper";
import { isLocalMode, verifyOtp } from "../lib/auth";
import { useAutoRefresh } from "../lib/useAutoRefresh";

export default function OTPVerify({ phone, devCode }) {
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	useAutoRefresh();

	async function onVerify() {
		setLoading(true);
		setError(null);

		try {
			await verifyOtp(phone, otp);
			router.replace("/ChoiceScreen");
		} catch (e) {
			setError(e?.message ?? "Could not verify the code. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			<Text variant="headlineMedium" style={styles.header}>
				Let's get you verified ✅
			</Text>

			{isLocalMode && devCode ? (
				<Banner visible icon="information" style={styles.banner}>
					{`Offline mode — your code is ${devCode}`}
				</Banner>
			) : null}

			<View style={styles.verticallySpaced}>
				<TextInput
					mode="outlined"
					label="OTP 🔐"
					placeholder="6-digit code"
					value={otp}
					keyboardType="number-pad"
					maxLength={6}
					onChangeText={(t) => setOtp(t.replace(/\D/g, ""))}
				/>
				<HelperText type="error" visible={Boolean(error)}>
					{error ?? " "}
				</HelperText>
			</View>

			<View style={styles.verticallySpaced}>
				<Button
					mode="contained"
					onPress={onVerify}
					loading={loading}
					disabled={loading || otp.length < 6}
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
	banner: {
		marginBottom: 12,
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
