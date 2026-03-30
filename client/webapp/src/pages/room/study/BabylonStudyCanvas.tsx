import type { User3DProfile, ZoomParticipant } from "@animal-zoom/share";
import { Color3, Engine } from "@babylonjs/core";
import React from "react";

import personalSpacesConfig from "../../../../../babylon-web/src/data/personalSpaces.json";
import type { AvatarType } from "../../../../../babylon-web/src/scene/assetLoader";
import type { PersonalSpace } from "../../../../../babylon-web/src/scene/personalSpaceTypes";
import {
	createPersonalSpaces,
	createSingleViewSceneBundleAsync,
	focusCameraOnDesk,
} from "../../../../../babylon-web/src/scene/sceneFactory";
import { AssetImage } from "../../../ui/AssetImage";

type BabylonStudyCanvasProps = {
	participant: ZoomParticipant;
	my3DProfile: User3DProfile | null;
	alt: string;
	className?: string;
};

const AVATAR_ROTATION: readonly AvatarType[] = [
	"apollo",
	"villager_oc",
	"macchiato",
	"molly_duck",
];

function resolveAvatarType(participantId: string): AvatarType {
	if (participantId === "apollo") {
		return "apollo";
	}

	let hash = 0;
	for (let index = 0; index < participantId.length; index += 1) {
		hash = (hash * 31 + participantId.charCodeAt(index)) >>> 0;
	}

	return AVATAR_ROTATION[hash % AVATAR_ROTATION.length] ?? "apollo";
}

export function BabylonStudyCanvas({
	participant,
	my3DProfile,
	alt,
	className,
}: BabylonStudyCanvasProps) {
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const [hasError, setHasError] = React.useState(false);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas === null) {
			return;
		}

		let disposed = false;
		let cleanupBundle: (() => void) | null = null;

		let engine: Engine;
		try {
			engine = new Engine(canvas, true, {
				preserveDrawingBuffer: false,
				stencil: true,
				adaptToDeviceRatio: true,
			});
		} catch (err) {
			console.error("Failed to initialize Babylon.js Engine", err);
			setHasError(true);
			return;
		}

		const resize = () => {
			engine.resize();
		};

		window.addEventListener("resize", resize);
		engine.runRenderLoop(() => {
			const activeScene = engine.scenes[0];
			if (activeScene && !activeScene.isDisposed) {
				activeScene.render();
			}
		});

		void createSingleViewSceneBundleAsync(engine, {
			attachControl: false,
			inputElement: canvas,
			avatarType:
				my3DProfile?.avatarType ?? resolveAvatarType(participant.animal.id),
			proxyName: `${participant.animal.id}-avatar-proxy`,
			proxyColor: new Color3(0.23, 0.48, 0.88),
		})
			.then(async (bundle) => {
				if (disposed) {
					bundle.dispose();
					return;
				}

				const spacesConfig = Array.isArray(personalSpacesConfig)
					? (personalSpacesConfig as PersonalSpace[])
					: [];
				const spacesWithoutAvatarAssets = spacesConfig.map((space) => ({
					...space,
					theme: my3DProfile?.environmentTheme ?? space.theme,
					assets: space.assets.filter((asset) => asset.type !== "avatar"),
				}));
				if (spacesWithoutAvatarAssets.length > 0) {
					const spaces = await createPersonalSpaces(
						bundle.scene,
						spacesWithoutAvatarAssets,
					);
					if (disposed) {
						bundle.dispose();
						return;
					}

					const firstSpace = spaces[0];
					if (firstSpace) {
						focusCameraOnDesk(bundle.scene, firstSpace);
					}
				}

				cleanupBundle = bundle.dispose;
			})
			.catch((error) => {
				if (disposed) {
					return;
				}

				console.error("Failed to initialize participant Babylon scene", error);
				setHasError(true);
			});

		return () => {
			disposed = true;
			window.removeEventListener("resize", resize);
			if (cleanupBundle !== null) {
				cleanupBundle();
			}
			engine.dispose();
		};
	}, [
		my3DProfile?.avatarType,
		my3DProfile?.environmentTheme,
		participant.animal.id,
	]);

	if (hasError) {
		return (
			<AssetImage
				alt={alt}
				className={className}
				src={participant.animal.imageUrl}
			/>
		);
	}

	return <canvas ref={canvasRef} className={className} />;
}
