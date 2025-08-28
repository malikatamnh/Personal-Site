import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

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

export default function ResultsScreen() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const [cars, setCars] = useState<Car[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		const url = new URL('/cars', API_BASE);
		Object.entries(params).forEach(([k, v]) => {
			if (v) url.searchParams.set(k, String(v));
		});
		fetch(url.toString(), { signal: controller.signal })
			.then(async (r) => {
				if (!r.ok) throw new Error('Failed to load');
				return r.json();
			})
			.then(setCars)
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
		return () => controller.abort();
	}, [JSON.stringify(params)]);

	if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
	if (error) return <View style={styles.center}><Text>{error}</Text></View>;

	return (
		<FlatList
			data={cars}
			keyExtractor={(item) => String(item.id)}
			renderItem={({ item }) => (
				<TouchableOpacity style={styles.card} onPress={() => router.push(`/detail/${item.id}`)}>
					{item.image ? (
						<Image source={{ uri: item.image }} style={styles.image} />
					) : (
						<View style={[styles.image, styles.placeholder]} />
					)}
					<View style={styles.info}>
						<Text style={styles.title}>{item.make} {item.model}</Text>
						<Text>{item.year} · {item.km?.toLocaleString?.() ?? item.km} ק"מ · {item.city}</Text>
						<Text style={styles.price}>{item.price?.toLocaleString?.() ?? item.price} ₪</Text>
					</View>
				</TouchableOpacity>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	card: { margin: 12, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2 },
	image: { width: '100%', height: 180, backgroundColor: '#eee' },
	placeholder: { alignItems: 'center', justifyContent: 'center' },
	info: { padding: 12 },
	title: { fontSize: 18, fontWeight: '600' },
	price: { fontSize: 16, fontWeight: '700', marginTop: 6 }
});