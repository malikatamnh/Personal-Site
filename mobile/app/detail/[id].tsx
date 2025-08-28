import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Button, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000';

type Car = {
	id: number;
	make: string;
	model: string;
	year: number;
	price: number;
	km: number;
	city: string;
	image?: string | null;
};

export default function DetailScreen() {
	const { id } = useLocalSearchParams();
	const [car, setCar] = useState<Car | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		const url = `${API_BASE}/cars/${id}`;
		fetch(url)
			.then(async (r) => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
			.then(setCar)
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
	if (error) return <View style={styles.center}><Text>{error}</Text></View>;
	if (!car) return <View style={styles.center}><Text>Not found</Text></View>;

	return (
		<ScrollView contentContainerStyle={{ padding: 16 }}>
			{car.image ? (
				<Image source={{ uri: car.image }} style={styles.image} />
			) : (
				<View style={[styles.image, { backgroundColor: '#eee' }]} />
			)}
			<Text style={styles.title}>{car.make} {car.model}</Text>
			<Text style={styles.meta}>{car.year} · {car.km?.toLocaleString?.() ?? car.km} ק"מ · {car.city}</Text>
			<Text style={styles.price}>{car.price?.toLocaleString?.() ?? car.price} ₪</Text>
			<View style={{ height: 12 }} />
			<Button title="צור קשר" onPress={() => Linking.openURL('tel:+000000000')} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	image: { width: '100%', height: 240, borderRadius: 8, marginBottom: 12 },
	title: { fontSize: 22, fontWeight: '700' },
	meta: { fontSize: 14, color: '#555', marginTop: 4 },
	price: { fontSize: 20, fontWeight: '700', marginTop: 8 }
});