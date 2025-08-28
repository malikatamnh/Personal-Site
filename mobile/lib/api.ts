export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000';

export async function apiGet<T>(path: string, token?: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined
	});
	if (!res.ok) throw new Error(await readError(res));
	return res.json();
}

export async function apiPost<T>(path: string, body: any, token?: string, isForm?: boolean): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: isForm ? undefined : { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
		body: isForm ? body : JSON.stringify(body)
	});
	if (!res.ok) throw new Error(await readError(res));
	return res.json();
}

async function readError(res: Response): Promise<string> {
	try {
		const data = await res.json();
		return data?.error || res.statusText || 'Request failed';
	} catch {
		return res.statusText || 'Request failed';
	}
}

