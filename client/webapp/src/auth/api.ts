export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

export async function apiRequest<T>(input: {
  path: string;
  method?: string;
  body?: unknown;
  token?: string | null;
}): Promise<T> {
  const url = `${API_BASE_URL}${input.path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (input.token) {
    headers.Authorization = `Bearer ${input.token}`;
  }

  const res = await fetch(url, {
    method: input.method ?? "GET",
    headers,
    body: input.body === undefined ? undefined : JSON.stringify(input.body)
  });

  const data = (await res.json()) as T;
  return data;
}
