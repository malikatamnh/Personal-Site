import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000';

export default function PostScreen() {
	const router = useRouter();
	const [make, setMake] = useState('');
	const [model, setModel] = useState('');
	const [year, setYear] = useState('');
	const [price, setPrice] = useState('');
	const [km, setKm] = useState('');
	const [city, setCity] = useState('');
	const [image, setImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function pickImage() {
		const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
		if (!result.canceled && result.assets?.length) {
			setImage(result.assets[0].uri);
		}
	}

	async function onSubmit() {
		try {
			setLoading(true);
			const form = new FormData();
			form.append('make', make);
			form.append('model', model);
			form.append('year', String(year));
			form.append('price', String(price));
			form.append('km', String(km));
			form.append('city', city);
			if (image) {
				const filename = image.split('/').pop() || 'photo.jpg';
				// @ts-ignore RN FormData file
				form.append('image', { uri: image, name: filename, type: 'image/jpeg' });
			}
			const res = await fetch(`${API_BASE}/cars`, { method: 'POST', body: form as any });
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || 'Failed to post');
			}
			const data = await res.json();
			Alert.alert('המודעה נשמרה');
			router.replace(`/detail/${data.id}`);
		} catch (e: any) {
			Alert.alert(e.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>פרסום מודעה</Text>
			<TextInput style={styles.input} placeholder="יצרן" value={make} onChangeText={setMake} />
			<TextInput style={styles.input} placeholder="דגם" value={model} onChangeText={setModel} />
			<TextInput style={styles.input} placeholder="שנה" keyboardType='numeric' value={year} onChangeText={setYear} />
			<TextInput style={styles.input} placeholder="מחיר" keyboardType='numeric' value={price} onChangeText={setPrice} />
			<TextInput style={styles.input} placeholder="ק"מ" keyboardType='numeric' value={km} onChangeText={setKm} />
			<TextInput style={styles.input} placeholder="עיר" value={city} onChangeText={setCity} />
			<Button title={image ? 'שנה תמונה' : 'בחר תמונה'} onPress={pickImage} />
			<Button title={loading ? 'שולח...' : 'פרסם'} onPress={onSubmit} disabled={loading} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, gap: 12 },
	title: { fontSize: 22, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
	input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }
});