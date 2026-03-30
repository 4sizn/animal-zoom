import type { User3DProfile, ZoomParticipant } from "@animal-zoom/share";
import { Animation, AnimationGroup, Color3, Engine } from "@babylonjs/core";
import type { Scene } from "@babylonjs/core";
import React from "react";

import personalSpacesConfig from "../../../../../babylon-web/src/data/personalSpaces.json";
import type { AvatarType } from "../../../../../babylon-web/src/scene/assetLoader";
import type { PersonalSpace } from "../../../../../babylon-web/src/scene/personalSpaceTypes";
import type { SceneBundle } from "../../../../../babylon-web/src/scene/sceneFactory";
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
	isStudying?: boolean;
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

function createStudyAnimationGroup(scene: Scene): AnimationGroup {
	const group = new AnimationGroup("study-motion", scene);

	const rootNodes = scene.transformNodes.filter(
		(n) =>
			n.name.includes("proxy") ||
			n.name === "__root__" ||
			n.name.includes("root"),
	);

	const targets =
		rootNodes.length > 0
			? rootNodes
			: scene.meshes.filter((m) => m.parent === null && m.name !== "__root__");

	for (const node of targets) {
		const posAnim = new Animation(
			"study-pos-y",
			"position.y",
			30,
			Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE,
		);
		posAnim.setKeys([
			{ frame: 0, value: node.position.y },
			{ frame: 15, value: node.position.y + 0.03 },
			{ frame: 30, value: node.position.y },
			{ frame: 45, value: node.position.y + 0.02 },
			{ frame: 60, value: node.position.y },
		]);

		const rotAnim = new Animation(
			"study-rot-x",
			"rotation.x",
			30,
			Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE,
		);
		rotAnim.setKeys([
			{ frame: 0, value: 0 },
			{ frame: 20, value: 0.08 },
			{ frame: 40, value: 0.05 },
			{ frame: 60, value: 0 },
		]);

		group.addTargetedAnimation(posAnim, node);
		group.addTargetedAnimation(rotAnim, node);
	}

	return group;
}

export function BabylonStudyCanvas({
	participant,
	my3DProfile,
	alt,
	className,
	isStudying,
}: BabylonStudyCanvasProps) {
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const [hasError, setHasError] = React.useState(false);
	const studyAnimGroupRef = React.useRef<AnimationGroup | null>(null);
	const bundleRef = React.useRef<SceneBundle | null>(null);
	const isStudyingRef = React.useRef(isStudying ?? false);

	React.useEffect(() => {
		isStudyingRef.current = isStudying ?? false;
		const group = studyAnimGroupRef.current;
		if (!group) return;

		if (isStudying) {
			if (!group.isPlaying) group.start(true);
		} else {
			if (group.isPlaying) group.stop();
		}
	}, [isStudying]);

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

				bundleRef.current = bundle;
				const studyGroup = createStudyAnimationGroup(bundle.scene);
				studyAnimGroupRef.current = studyGroup;
				if (isStudyingRef.current) {
					studyGroup.start(true);
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
			studyAnimGroupRef.current?.stop();
			studyAnimGroupRef.current = null;
			bundleRef.current = null;
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
