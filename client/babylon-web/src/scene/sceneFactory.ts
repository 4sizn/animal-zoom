import {
	type AbstractMesh,
	ArcRotateCamera,
	Color3,
	type Engine,
	HemisphericLight,
	MeshBuilder,
	Scene,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";
import {
	type AvatarType,
	loadCharacterByAvatarType,
} from "./assetLoader";

export type SceneFactoryOptions = {
	attachControl?: boolean;
	inputElement?: HTMLElement;
};

export type SceneBundle = {
	scene: Scene;
	camera: ArcRotateCamera;
	dispose: () => void;
};

export type AsyncSingleViewSceneFactoryOptions = SceneFactoryOptions & {
	avatarType?: AvatarType;
	proxyName?: string;
	proxyColor?: Color3;
};

function frameCameraToVisibleMeshes(
	camera: ArcRotateCamera,
	meshes: ReadonlyArray<AbstractMesh>,
): void {
	let boundsMin: Vector3 | null = null;
	let boundsMax: Vector3 | null = null;

	for (const mesh of meshes) {
		if (mesh.isDisposed() || !mesh.isEnabled() || mesh.getTotalVertices() <= 0) {
			continue;
		}

		mesh.computeWorldMatrix(true);
		const boundingBox = mesh.getBoundingInfo().boundingBox;
		boundsMin = boundsMin
			? Vector3.Minimize(boundsMin, boundingBox.minimumWorld)
			: boundingBox.minimumWorld.clone();
		boundsMax = boundsMax
			? Vector3.Maximize(boundsMax, boundingBox.maximumWorld)
			: boundingBox.maximumWorld.clone();
	}

	if (!boundsMin || !boundsMax) {
		return;
	}

	const center = boundsMin.add(boundsMax).scale(0.5);
	const size = boundsMax.subtract(boundsMin);
	const maxSize = Math.max(size.x, size.y, size.z);

	if (maxSize <= 0) {
		return;
	}

	camera.setTarget(center);
	camera.alpha = -Math.PI / 2;
	camera.beta = Math.PI / 3;
	camera.radius = Math.min(Math.max(maxSize * 0.8, 1.2), 2.8);
}

function createSingleViewSceneBase(
	engine: Engine,
	options: SceneFactoryOptions,
): SceneBundle {
	const scene = new Scene(engine);
	scene.clearColor.set(0.94, 0.97, 1.0, 1);

	const camera = new ArcRotateCamera(
		"single-view-camera",
		-Math.PI / 2,
		Math.PI / 3,
		5.5,
		new Vector3(0, 1, 0),
		scene,
	);

	if (options.attachControl === true && options.inputElement) {
		camera.attachControl(options.inputElement, true);
	}

	const light = new HemisphericLight(
		"single-view-light",
		new Vector3(0, 1, 0),
		scene,
	);
	light.intensity = 0.95;

	MeshBuilder.CreateGround(
		"single-view-ground",
		{ width: 10, height: 10 },
		scene,
	);

	return {
		scene,
		camera,
		dispose: () => {
			camera.detachControl();
			scene.dispose();
		},
	};
}

export async function createSingleViewSceneBundleAsync(
	engine: Engine,
	options: AsyncSingleViewSceneFactoryOptions = {},
): Promise<SceneBundle> {
	const bundle = createSingleViewSceneBase(engine, options);
	await loadCharacterByAvatarType(
		bundle.scene,
		options.avatarType ?? "apollo",
		{
			proxyName: options.proxyName ?? "single-view-avatar-proxy",
			proxyColor: options.proxyColor ?? new Color3(0.23, 0.48, 0.88),
		},
	);

	return bundle;
}

export function createSingleViewSceneBundle(
	engine: Engine,
	options: SceneFactoryOptions = {},
): SceneBundle {
	const bundle = createSingleViewSceneBase(engine, options);

	const mesh = MeshBuilder.CreateBox(
		"single-view-avatar-proxy",
		{ size: 1.4 },
		bundle.scene,
	);
	mesh.position.y = 0.7;

	const meshMaterial = new StandardMaterial(
		"single-view-avatar-proxy-material",
		bundle.scene,
	);
	meshMaterial.diffuseColor = new Color3(0.23, 0.48, 0.88);
	mesh.material = meshMaterial;

	return bundle;
}

export function createParticipantViewSceneBundle(
	engine: Engine,
	participantId: string,
	options: SceneFactoryOptions = {},
): SceneBundle {
	const scene = new Scene(engine);
	scene.clearColor.set(0.98, 0.97, 0.93, 1);

	const camera = new ArcRotateCamera(
		`${participantId}-camera`,
		-Math.PI / 2,
		Math.PI / 2.7,
		6,
		new Vector3(0, 1, 0),
		scene,
	);

	if (options.attachControl === true && options.inputElement) {
		camera.attachControl(options.inputElement, true);
	}

	const light = new HemisphericLight(
		`${participantId}-light`,
		new Vector3(0, 1, 0),
		scene,
	);
	light.intensity = 0.8;

	MeshBuilder.CreateGround(
		`${participantId}-ground`,
		{ width: 8, height: 8 },
		scene,
	);

	const mesh = MeshBuilder.CreateSphere(
		`${participantId}-avatar-proxy`,
		{ diameter: 1.2 },
		scene,
	);
	mesh.position.y = 0.8;
	const proxyName = `${participantId}-avatar-proxy`;
	const proxyColor = new Color3(0.81, 0.47, 0.2);

	const meshMaterial = new StandardMaterial(
		`${participantId}-avatar-proxy-material`,
		scene,
	);
	meshMaterial.diffuseColor = proxyColor;
	mesh.material = meshMaterial;

	void loadCharacterByAvatarType(scene, "apollo", { proxyName, proxyColor })
		.then((loadedMeshes) => {
			const fallbackMeshNames = new Set([
				`${proxyName}-body`,
				`${proxyName}-head`,
			]);
			const isFallbackLoad =
				loadedMeshes.length === fallbackMeshNames.size &&
				loadedMeshes.every((loadedMesh) =>
					fallbackMeshNames.has(loadedMesh.name),
				);

			if (isFallbackLoad || scene.isDisposed || mesh.isDisposed()) {
				return;
			}

			frameCameraToVisibleMeshes(camera, loadedMeshes);

			if (scene.isDisposed || mesh.isDisposed()) {
				return;
			}

			mesh.setEnabled(false);
		})
		.catch((error) => {
			console.error(
				`Failed to attach participant avatar (${participantId})`,
				error,
			);
		});

	return {
		scene,
		camera,
		dispose: () => {
			camera.detachControl();
			scene.dispose();
		},
	};
}
