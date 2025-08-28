import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthProvider';
export { default as default } from '../profile';

export function unstable_settings() { return { initialRouteName: 'profile' }; }

export function Guard() {
	const { token, loading } = useAuth();
	if (loading) return null;
	if (!token) return <Redirect href="/login" />;
	return null;
}