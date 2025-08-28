import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken as saveToken, clearToken } from '../../lib/auth';

interface AuthContextValue {
	token: string | null;
	loading: boolean;
	setToken: (t: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ token: null, loading: true, setToken: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setTokenState] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getToken().then(setTokenState).catch(() => {}).finally(() => setLoading(false));
	}, []);

	const value = useMemo(() => ({
		token,
		loading,
		setToken: async (t: string | null) => {
			setTokenState(t);
			if (t) await saveToken(t); else await clearToken();
		}
	}), [token, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}