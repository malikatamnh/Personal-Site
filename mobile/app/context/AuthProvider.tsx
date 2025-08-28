import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken as saveToken, clearToken } from '../../lib/auth';

interface AuthContextValue {
	token: string | null;
	setToken: (t: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ token: null, setToken: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setTokenState] = useState<string | null>(null);

	useEffect(() => {
		getToken().then(setTokenState).catch(() => {});
	}, []);

	const value = useMemo(() => ({
		token,
		setToken: async (t: string | null) => {
			setTokenState(t);
			if (t) await saveToken(t); else await clearToken();
		}
	}), [token]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}