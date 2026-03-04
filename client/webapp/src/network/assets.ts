import { apiRequest } from "./apiClient";

type PresignResponse = {
	ok: boolean;
	url?: string;
	error?: string;
};

const presignCache = new Map<string, string>();

function parseAssetKey(src: string): string | null {
	const trimmed = src.trim();
	if (!trimmed.startsWith("asset:")) {
		return null;
	}

	let rest = trimmed.slice("asset:".length);
	if (rest.startsWith("//")) {
		rest = rest.slice(2);
	}

	const key = rest.trim();
	if (key.length === 0) {
		return null;
	}

	return key;
}

export async function resolveAssetImageSrc(src: string): Promise<string> {
	const key = parseAssetKey(src);
	if (!key) {
		return src;
	}

	const cached = presignCache.get(key);
	if (cached) {
		return cached;
	}

	try {
		const data = await apiRequest<PresignResponse>({
			path: "/assets/presign",
			method: "POST",
			body: { key },
		});

		if (data.ok && typeof data.url === "string" && data.url.length > 0) {
			presignCache.set(key, data.url);
			return data.url;
		}
	} catch {}

	return src;
}
