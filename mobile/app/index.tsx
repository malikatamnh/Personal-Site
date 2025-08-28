import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
	const router = useRouter();
	const [make, setMake] = useState('');
	const [model, setModel] = useState('');
	const [year, setYear] = useState('');
	const [price, setPrice] = useState('');

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>חיפוש רכבים</Text>
			<TextInput style={styles.input} placeholder="יצרן" value={make} onChangeText={setMake} />
			<TextInput style={styles.input} placeholder="דגם" value={model} onChangeText={setModel} />
			<TextInput style={styles.input} placeholder="שנה" keyboardType="numeric" value={year} onChangeText={setYear} />
			<TextInput style={styles.input} placeholder="מחיר מקס'" keyboardType="numeric" value={price} onChangeText={setPrice} />
			<Button title="חפש" onPress={() => {
				router.push({ pathname: '/results', params: { make, model, year, price } });
			}} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, gap: 12 },
	title: { fontSize: 22, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
	input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }
});