import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { isLocalMode, sendOtp } from "../lib/auth";
import { useAutoRefresh } from "../lib/useAutoRefresh";

export default function Auth({ phone, setPhone, setSentCode, setDevCode }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	useAutoRefresh();

	const digits = String(phone ?? "").replace(/\D/g, "");
	const valid = digits.length === 10;

	async function signInWithPhone() {
		setLoading(true);
		setError(null);

		try {
			const { devCode } = await sendOtp(digits);
			setDevCode(devCode ?? null);
			setSentCode(true);
		} catch (e) {
			// Never let a rejection go unhandled -- in a release build that
			// surfaces as a native crash rather than a message.
			setError(e?.message ?? "Could not send the code. Please try again.");
		} finally {
			setLoading(false);
		}
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
					placeholder="10-digit number"
					value={phone}
					keyboardType="phone-pad"
					maxLength={10}
					onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
				/>
				<HelperText type={error ? "error" : "info"} visible>
					{error ??
						(isLocalMode
							? "Offline mode — the code is shown on the next screen."
							: "We'll text you a verification code.")}
				</HelperText>
			</View>

			<View style={styles.verticallySpaced}>
				<Button
					mode="contained"
					onPress={signInWithPhone}
					loading={loading}
					disabled={loading || !valid}
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
