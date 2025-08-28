import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000';

export default function RegisterScreen() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	async function onRegister() {
		try {
			setLoading(true);
			const res = await fetch(`${API_BASE}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || 'Registration failed');
			}
			Alert.alert('נרשמת בהצלחה');
		} catch (e: any) {
			Alert.alert(e.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>הרשמה</Text>
			<TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
			<TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize='none' value={email} onChangeText={setEmail} />
			<TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
			<Button title={loading ? '...' : 'הרשמה'} onPress={onRegister} disabled={loading} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, gap: 12 },
	title: { fontSize: 22, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
	input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }
});