import {
	type AbstractMesh,
	ArcRotateCamera,
	Color3,
	DynamicTexture,
	type Engine,
	HemisphericLight,
	Mesh,
	MeshBuilder,
	PointLight,
	Scene,
	SceneLoader,
	SpotLight,
	StandardMaterial,
	TransformNode,
	Vector3,
} from "@babylonjs/core";
import { type AvatarType, loadCharacterByAvatarType } from "./assetLoader";
import { generateGridPositions } from "./gridPositions";
import type {
	AssetSpec,
	PersonalSpace,
	Vector3Like,
} from "./personalSpaceTypes";

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
	avatarType?: AvatarType | null;
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
		if (
			mesh.isDisposed() ||
			!mesh.isEnabled() ||
			mesh.getTotalVertices() <= 0
		) {
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
	if (options.avatarType !== null) {
		await loadCharacterByAvatarType(
			bundle.scene,
			options.avatarType ?? "apollo",
			{
				proxyName: options.proxyName ?? "single-view-avatar-proxy",
				proxyColor: options.proxyColor ?? new Color3(0.23, 0.48, 0.88),
			},
		);
	}

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

function toVector3(value: Vector3Like): Vector3 {
	return new Vector3(value.x, value.y, value.z);
}

function isAvatarType(value: unknown): value is AvatarType {
	return (
		value === "apollo" ||
		value === "villager_oc" ||
		value === "macchiato" ||
		value === "molly_duck"
	);
}

function applyAssetTransform(
	node: TransformNode | AbstractMesh,
	asset: AssetSpec,
): void {
	if (asset.position) {
		node.position.copyFrom(toVector3(asset.position));
	}

	if (asset.rotation) {
		node.rotation.copyFrom(toVector3(asset.rotation));
	}

	if (asset.scale) {
		node.scaling.copyFrom(toVector3(asset.scale));
	}
}

function createNameTagPlane(scene: Scene, name: string, text: string): Mesh {
	const plane = MeshBuilder.CreatePlane(
		name,
		{ width: 1.6, height: 0.4 },
		scene,
	);
	plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

	const texture = new DynamicTexture(
		`${name}-texture`,
		{ width: 512, height: 128 },
		scene,
		true,
	);
	texture.hasAlpha = true;
	texture.drawText(
		text,
		null,
		96,
		"bold 72px Arial",
		"#ffffff",
		"transparent",
		true,
	);

	const material = new StandardMaterial(`${name}-material`, scene);
	material.diffuseTexture = texture;
	material.emissiveColor = new Color3(1, 1, 1);
	material.useAlphaFromDiffuseTexture = true;
	material.disableLighting = true;
	plane.material = material;

	return plane;
}

function createBackgroundAssets(
	scene: Scene,
	spaceNode: TransformNode,
	space: PersonalSpace,
	asset: AssetSpec,
): void {
	const size = space.size ?? { width: 5, depth: 5 };
	const theme = (space.theme ?? "default").toLowerCase();

	const floor = MeshBuilder.CreateGround(
		`${asset.id}-floor`,
		{ width: size.width, height: size.depth },
		scene,
	);
	floor.parent = spaceNode;
	applyAssetTransform(floor, asset);

	const wall = MeshBuilder.CreatePlane(
		`${asset.id}-wall`,
		{ width: size.width, height: 2.6 },
		scene,
	);
	wall.parent = spaceNode;
	wall.position = new Vector3(0, 1.3, size.depth / 2);
	wall.rotation = new Vector3(0, Math.PI, 0);

	const material = new StandardMaterial(
		`${asset.id}-background-material`,
		scene,
	);
	if (theme === "music") {
		material.diffuseColor = new Color3(0.18, 0.15, 0.22);
	} else if (theme === "cafe") {
		material.diffuseColor = new Color3(0.25, 0.21, 0.18);
	} else if (theme === "study") {
		material.diffuseColor = new Color3(0.2, 0.22, 0.18);
	} else {
		material.diffuseColor = new Color3(0.22, 0.24, 0.28);
	}
	material.specularColor = new Color3(0.05, 0.05, 0.05);
	floor.material = material;
	wall.material = material;
}

function createFurnitureMesh(
	scene: Scene,
	spaceNode: TransformNode,
	asset: AssetSpec,
): void {
	const key = asset.key.toLowerCase();
	const material = new StandardMaterial(`${asset.id}-material`, scene);
	material.diffuseColor = new Color3(0.62, 0.48, 0.32);
	material.specularColor = new Color3(0.1, 0.1, 0.1);

	if (key.includes("desk")) {
		const top = MeshBuilder.CreateBox(
			`${asset.id}-desk-top`,
			{ width: 1.6, depth: 0.8, height: 0.1 },
			scene,
		);
		top.parent = spaceNode;
		top.position.set(0, 0.75, 0);
		top.material = material;
		applyAssetTransform(top, asset);
		return;
	}

	if (key.includes("chair")) {
		const seat = MeshBuilder.CreateBox(
			`${asset.id}-chair-seat`,
			{ width: 0.6, depth: 0.6, height: 0.08 },
			scene,
		);
		seat.parent = spaceNode;
		seat.position.set(0, 0.45, 0);
		seat.material = material;
		applyAssetTransform(seat, asset);
		return;
	}

	if (key.includes("plant")) {
		const pot = MeshBuilder.CreateCylinder(
			`${asset.id}-plant-pot`,
			{ diameter: 0.35, height: 0.25 },
			scene,
		);
		pot.parent = spaceNode;
		pot.position.set(0, 0.125, 0);
		pot.material = material;
		applyAssetTransform(pot, asset);
		return;
	}

	const fallback = MeshBuilder.CreateBox(
		`${asset.id}-mesh`,
		{ size: 0.8 },
		scene,
	);
	fallback.parent = spaceNode;
	fallback.material = material;
	applyAssetTransform(fallback, asset);
}

function getAssetUrl(asset: AssetSpec): string | null {
	const url = asset.options?.url;
	return typeof url === "string" && url.length > 0 ? url : null;
}

async function createMeshFromUrl(
	scene: Scene,
	spaceNode: TransformNode,
	asset: AssetSpec,
	url: string,
): Promise<void> {
	const lastSlashIndex = url.lastIndexOf("/");
	const rootUrl = lastSlashIndex >= 0 ? url.slice(0, lastSlashIndex + 1) : "";
	const fileName = lastSlashIndex >= 0 ? url.slice(lastSlashIndex + 1) : url;

	const assetNode = new TransformNode(asset.id, scene);
	assetNode.parent = spaceNode;
	applyAssetTransform(assetNode, asset);

	try {
		const result = await SceneLoader.ImportMeshAsync(
			"",
			rootUrl,
			fileName,
			scene,
		);
		result.meshes.forEach((mesh) => {
			mesh.parent = assetNode;
		});
	} catch (error) {
		console.error(`Failed to load mesh asset (${url})`, error);
		const material = new StandardMaterial(
			`${asset.id}-fallback-material`,
			scene,
		);
		material.diffuseColor = new Color3(0.62, 0.48, 0.32);
		material.specularColor = new Color3(0.1, 0.1, 0.1);
		const fallback = MeshBuilder.CreateBox(
			`${asset.id}-fallback-mesh`,
			{ size: 0.8 },
			scene,
		);
		fallback.parent = assetNode;
		fallback.material = material;
	}
}

function createLocalLight(
	scene: Scene,
	spaceNode: TransformNode,
	asset: AssetSpec,
): void {
	const key = asset.key.toLowerCase();
	const position = toVector3(asset.position);
	const intensityOption = asset.options?.intensity;
	const intensity = typeof intensityOption === "number" ? intensityOption : 1;

	if (key.includes("spot")) {
		const light = new SpotLight(
			asset.id,
			position,
			new Vector3(0, -1, 0.15),
			Math.PI / 3,
			2,
			scene,
		);
		light.intensity = intensity;
		light.parent = spaceNode;
		return;
	}

	const light = new PointLight(asset.id, position, scene);
	light.intensity = intensity;
	light.parent = spaceNode;
}

function orderedAssets(assets: AssetSpec[]): AssetSpec[] {
	const rankByType: Record<string, number> = {
		background: 0,
		mesh: 1,
		avatar: 2,
		light: 3,
		ui: 4,
	};

	return [...assets].sort((a, b) => {
		const rankA = rankByType[a.type] ?? 99;
		const rankB = rankByType[b.type] ?? 99;
		return rankA - rankB;
	});
}

export async function createPersonalSpaces(
	scene: Scene,
	config: PersonalSpace[],
): Promise<TransformNode[]> {
	const fallbackPositions = generateGridPositions(
		config.length,
		{ width: 5, depth: 5 },
		1,
	);

	const spaces: TransformNode[] = [];

	for (const [index, space] of config.entries()) {
		const spaceNode = new TransformNode(space.id, scene);
		const position = space.position
			? toVector3(space.position)
			: (fallbackPositions[index] ?? Vector3.Zero());
		spaceNode.position.copyFrom(position);
		spaces.push(spaceNode);

		for (const asset of orderedAssets(space.assets)) {
			if (asset.type === "background") {
				createBackgroundAssets(scene, spaceNode, space, asset);
				continue;
			}

			if (asset.type === "mesh") {
				const url = getAssetUrl(asset);
				if (url) {
					await createMeshFromUrl(scene, spaceNode, asset, url);
				} else {
					createFurnitureMesh(scene, spaceNode, asset);
				}
				continue;
			}

			if (asset.type === "avatar") {
				const avatarNode = new TransformNode(asset.id, scene);
				avatarNode.parent = spaceNode;
				applyAssetTransform(avatarNode, asset);

				const avatarType = isAvatarType(
					(asset as { avatarType?: unknown }).avatarType,
				)
					? (asset as { avatarType: AvatarType }).avatarType
					: "apollo";

				const loaded = await loadCharacterByAvatarType(scene, avatarType, {
					proxyName: asset.id,
					proxyColor: new Color3(0.23, 0.48, 0.88),
				});

				loaded.forEach((mesh) => {
					mesh.parent = avatarNode;
				});
				continue;
			}

			if (asset.type === "light") {
				createLocalLight(scene, spaceNode, asset);
				continue;
			}

			if (asset.type === "ui") {
				const textOption = asset.options?.text;
				const text = typeof textOption === "string" ? textOption : space.name;
				const plane = createNameTagPlane(scene, asset.id, text);
				plane.parent = spaceNode;
				applyAssetTransform(plane, asset);
				continue;
			}
		}
	}

	return spaces;
}

export function focusCameraOnDesk(
	scene: Scene,
	spaceNode: TransformNode,
): void {
	const camera = scene.activeCamera;
	if (!(camera instanceof ArcRotateCamera)) {
		return;
	}

	const deskNodes = spaceNode
		.getChildTransformNodes(false)
		.filter((node) => node.name.toLowerCase().includes("desk"));
	const deskNode = deskNodes[0];

	if (deskNode) {
		const meshes = deskNode.getChildMeshes(false);
		frameCameraToVisibleMeshes(camera, meshes);
	} else {
		camera.setTarget(
			spaceNode.getAbsolutePosition().add(new Vector3(0, 0.9, 0)),
		);
	}

	camera.alpha = -Math.PI / 2;
	camera.beta = Math.PI / 3;
	camera.radius = 6;
	camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius;
	camera.lowerBetaLimit = camera.upperBetaLimit = camera.beta;
}
