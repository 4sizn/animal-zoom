import React from "react";

import { apiRequest } from "../auth/api";

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

export function AssetImage(
	props: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
		src: string;
	},
): React.JSX.Element {
	const { src, ...rest } = props;
	const [resolvedSrc, setResolvedSrc] = React.useState(src);

	React.useEffect(() => {
		setResolvedSrc(src);
		const key = parseAssetKey(src);
		if (!key) {
			return;
		}

		const cached = presignCache.get(key);
		if (cached) {
			setResolvedSrc(cached);
			return;
		}

		let cancelled = false;
		void (async () => {
			try {
				const data = await apiRequest<PresignResponse>({
					path: "/assets/presign",
					method: "POST",
					body: { key },
				});

				if (cancelled) {
					return;
				}

				if (data.ok && typeof data.url === "string" && data.url.length > 0) {
					presignCache.set(key, data.url);
					setResolvedSrc(data.url);
					return;
				}
			} catch {}

			if (!cancelled) {
				setResolvedSrc(src);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [src]);

	return <img {...rest} src={resolvedSrc} />;
}
