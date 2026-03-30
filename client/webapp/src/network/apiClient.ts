import { API_BASE_URL } from "../system/env";

export async function apiRequest<T>(input: {
	path: string;
	method?: string;
	body?: unknown;
	token?: string | null;
}): Promise<T> {
	const url = `${API_BASE_URL}${input.path}`;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (input.token) {
		headers.Authorization = `Bearer ${input.token}`;
	}

	const res = await fetch(url, {
		method: input.method ?? "GET",
		headers,
		body: input.body === undefined ? undefined : JSON.stringify(input.body),
	});

	try {
		const data = (await res.json()) as T;
		return data;
	} catch {
		throw new Error(`서버 응답을 처리할 수 없습니다 (HTTP ${res.status})`);
	}
}
