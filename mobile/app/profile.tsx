import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { API_BASE } from '../lib/api';
import { useAuth } from './context/AuthProvider';

export default function ProfileScreen() {
	const { token, setToken } = useAuth();
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				if (!token) throw new Error('Not logged in');
				const res = await fetch(`${API_BASE}/auth/profile`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (!res.ok) throw new Error('Failed to load');
				setUser(await res.json());
			} catch (e: any) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		})();
	}, [token]);

	async function logout() {
		await setToken(null);
		Alert.alert('התנתקת');
	}

	if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
	if (error) return <View style={styles.center}><Text>{error}</Text></View>;
	if (!user) return <View style={styles.center}><Text>לא מחובר</Text></View>;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{user.name}</Text>
			<Text>{user.email}</Text>
			<Button title="התנתק" onPress={logout} />
		</View>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	container: { padding: 16, gap: 12 },
	title: { fontSize: 22, fontWeight: '700' }
});