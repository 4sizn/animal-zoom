import React from "react";

import { CommandManager } from "../core/managers/CommandManager";

export function AssetImage(
	props: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
		src: string;
	},
): React.JSX.Element {
	const { src, ...rest } = props;
	const [resolvedSrc, setResolvedSrc] = React.useState(src);

	React.useEffect(() => {
		let cancelled = false;

		setResolvedSrc(src);
		void (async () => {
			const next = (await CommandManager.getInstance().command(
				"AssetsCommand",
				"resolveImageSrc",
				{ src },
			)) as string;
			if (!cancelled) {
				setResolvedSrc(next);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [src]);

	return <img {...rest} src={resolvedSrc} />;
}
