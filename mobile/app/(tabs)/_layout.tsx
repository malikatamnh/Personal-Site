import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
	return (
		<Tabs screenOptions={{ headerTitleAlign: 'center' }}>
			<Tabs.Screen name="index" options={{ title: 'חיפוש' }} />
			<Tabs.Screen name="results" options={{ title: 'תוצאות' }} />
			<Tabs.Screen name="post" options={{ title: 'פרסום' }} />
			<Tabs.Screen name="profile" options={{ title: 'פרופיל' }} />
		</Tabs>
	);
}

