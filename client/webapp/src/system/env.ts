export const API_BASE_URL =
	(import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

export const ZOOM_SOCKET_URL = `${API_BASE_URL}/zoom`;
