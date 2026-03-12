import {
	type AbstractMesh,
	ArcRotateCamera,
	Color3,
	DefaultRenderingPipeline,
	DirectionalLight,
	DynamicTexture,
	type Engine,
	HemisphericLight,
	ImageProcessingConfiguration,
	Mesh,
	MeshBuilder,
	PointLight,
	Scene,
	SceneLoader,
	ShadowGenerator,
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

type StudioLights = {
	key: DirectionalLight;
	fill: HemisphericLight;
	rim: PointLight;
};

function enableStudioShadows(scene: Scene, keyLight: DirectionalLight): void {
	const shadowGenerator = new ShadowGenerator(1024, keyLight);
	shadowGenerator.useBlurExponentialShadowMap = true;
	shadowGenerator.blurKernel = 16;
	shadowGenerator.setDarkness(0.35);

	keyLight.shadowMinZ = 0.1;
	keyLight.shadowMaxZ = 35;

	scene.onNewMeshAddedObservable.add((mesh) => {
		if (mesh.isDisposed() || mesh.getTotalVertices() <= 0) {
			return;
		}

		const name = mesh.name.toLowerCase();
		const isReceiver =
			name.includes("ground") ||
			name.includes("-floor") ||
			name.includes("-wall");
		if (isReceiver) {
			mesh.receiveShadows = true;
			return;
		}

		shadowGenerator.addShadowCaster(mesh, true);
	});
}

function attachStudioPostProcessing(
	scene: Scene,
	camera: ArcRotateCamera,
): DefaultRenderingPipeline {
	const imageProcessing = scene.imageProcessingConfiguration;
	imageProcessing.toneMappingEnabled = true;
	imageProcessing.toneMappingType =
		ImageProcessingConfiguration.TONEMAPPING_ACES;
	imageProcessing.exposure = 1.04;
	imageProcessing.contrast = 1.08;

	const pipeline = new DefaultRenderingPipeline(
		"studio-default-pipeline",
		true,
		scene,
		[camera],
	);
	pipeline.samples = 1;
	pipeline.bloomEnabled = true;
	pipeline.bloomKernel = 52;
	pipeline.bloomThreshold = 0.72;
	pipeline.bloomWeight = 0.18;

	return pipeline;
}

function applyStudioArtDirection(scene: Scene): StudioLights {
	scene.clearColor.set(0.09, 0.085, 0.12, 1);

	scene.fogMode = Scene.FOGMODE_EXP2;
	scene.fogDensity = 0.009;
	scene.fogColor = new Color3(0.1, 0.095, 0.13);

	scene.ambientColor = new Color3(0.075, 0.07, 0.075);

	const key = new DirectionalLight(
		"studio-key-light",
		new Vector3(-0.35, -1, -0.25),
		scene,
	);
	key.position = new Vector3(4.2, 6.0, 2.6);
	key.intensity = 0.84;
	key.diffuse = new Color3(1.0, 0.92, 0.82);
	key.specular = new Color3(0.7, 0.7, 0.7);

	const fill = new HemisphericLight(
		"studio-fill-light",
		new Vector3(0, 1, 0),
		scene,
	);
	fill.intensity = 0.5;
	fill.diffuse = new Color3(0.62, 0.69, 0.88);
	fill.groundColor = new Color3(0.18, 0.16, 0.14);
	fill.specular = new Color3(0.06, 0.06, 0.06);

	const rim = new PointLight(
		"studio-rim-light",
		new Vector3(-3.6, 2.5, -3.8),
		scene,
	);
	rim.intensity = 0.28;
	rim.diffuse = new Color3(0.72, 0.82, 1.0);
	rim.specular = new Color3(0.5, 0.5, 0.5);

	return { key, fill, rim };
}

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
	const studioLights = applyStudioArtDirection(scene);

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

	const pipeline = attachStudioPostProcessing(scene, camera);

	MeshBuilder.CreateGround(
		"single-view-ground",
		{ width: 10, height: 10 },
		scene,
	);

	enableStudioShadows(scene, studioLights.key);

	return {
		scene,
		camera,
		dispose: () => {
			camera.detachControl();
			pipeline.dispose();
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
	const studioLights = applyStudioArtDirection(scene);

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

	const pipeline = attachStudioPostProcessing(scene, camera);

	MeshBuilder.CreateGround(
		`${participantId}-ground`,
		{ width: 8, height: 8 },
		scene,
	);

	enableStudioShadows(scene, studioLights.key);

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
			pipeline.dispose();
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

	const backgroundRoot = new TransformNode(
		`${asset.id}-background-root`,
		scene,
	);
	backgroundRoot.parent = spaceNode;
	applyAssetTransform(backgroundRoot, asset);

	const palette =
		theme === "music"
			? {
					wall: new Color3(0.2, 0.17, 0.27),
					floor: new Color3(0.16, 0.12, 0.18),
					accent: new Color3(0.69, 0.48, 0.92),
					windowGlow: new Color3(0.46, 0.42, 0.72),
				}
			: theme === "cafe"
				? {
						wall: new Color3(0.34, 0.27, 0.21),
						floor: new Color3(0.26, 0.19, 0.14),
						accent: new Color3(0.89, 0.64, 0.39),
						windowGlow: new Color3(0.92, 0.74, 0.5),
					}
				: theme === "study"
					? {
							wall: new Color3(0.24, 0.28, 0.22),
							floor: new Color3(0.17, 0.21, 0.16),
							accent: new Color3(0.57, 0.73, 0.47),
							windowGlow: new Color3(0.76, 0.88, 0.75),
						}
					: {
							wall: new Color3(0.25, 0.26, 0.31),
							floor: new Color3(0.18, 0.2, 0.24),
							accent: new Color3(0.66, 0.76, 0.95),
							windowGlow: new Color3(0.72, 0.82, 0.96),
						};

	const floorMaterial = new StandardMaterial(
		`${asset.id}-floor-material`,
		scene,
	);
	floorMaterial.diffuseColor = palette.floor;
	floorMaterial.emissiveColor = palette.floor.scale(0.03);
	floorMaterial.specularColor = new Color3(0.04, 0.04, 0.04);

	const wallMaterial = new StandardMaterial(`${asset.id}-wall-material`, scene);
	wallMaterial.diffuseColor = palette.wall;
	wallMaterial.specularColor = new Color3(0.05, 0.05, 0.05);
	wallMaterial.emissiveColor = palette.wall.scale(0.06);

	const floor = MeshBuilder.CreateGround(
		`${asset.id}-floor`,
		{ width: size.width, height: size.depth },
		scene,
	);
	floor.parent = backgroundRoot;
	floor.material = floorMaterial;

	const backWall = MeshBuilder.CreatePlane(
		`${asset.id}-wall-back`,
		{ width: size.width, height: 2.6 },
		scene,
	);
	backWall.parent = backgroundRoot;
	backWall.position = new Vector3(0, 1.3, size.depth / 2);
	backWall.rotation = new Vector3(0, Math.PI, 0);
	backWall.material = wallMaterial;

	const sideWall = MeshBuilder.CreatePlane(
		`${asset.id}-wall-side`,
		{ width: size.depth, height: 2.6 },
		scene,
	);
	sideWall.parent = backgroundRoot;
	sideWall.position = new Vector3(size.width / 2, 1.3, 0);
	sideWall.rotation = new Vector3(0, -Math.PI / 2, 0);
	sideWall.material = wallMaterial;

	const rugMaterial = new StandardMaterial(`${asset.id}-rug-material`, scene);
	rugMaterial.diffuseColor = palette.accent.scale(0.62);
	rugMaterial.emissiveColor = palette.accent.scale(0.08);
	rugMaterial.specularColor = new Color3(0.03, 0.03, 0.03);
	const rug = MeshBuilder.CreateGround(
		`${asset.id}-rug`,
		{
			width: Math.max(size.width * 0.55, 1.8),
			height: Math.max(size.depth * 0.28, 1.2),
		},
		scene,
	);
	rug.parent = backgroundRoot;
	rug.position = new Vector3(0, 0.01, -size.depth * 0.08);
	rug.material = rugMaterial;

	const trimMaterial = new StandardMaterial(`${asset.id}-trim-material`, scene);
	trimMaterial.diffuseColor = palette.accent.scale(0.72);
	trimMaterial.emissiveColor = palette.accent.scale(0.08);
	trimMaterial.specularColor = new Color3(0.08, 0.08, 0.08);
	const topTrim = MeshBuilder.CreateBox(
		`${asset.id}-wall-top-trim`,
		{ width: size.width * 0.96, height: 0.08, depth: 0.06 },
		scene,
	);
	topTrim.parent = backgroundRoot;
	topTrim.position = new Vector3(0, 2.56, size.depth / 2 - 0.03);
	topTrim.material = trimMaterial;

	const windowMaterial = new StandardMaterial(
		`${asset.id}-window-material`,
		scene,
	);
	windowMaterial.diffuseColor = palette.windowGlow.scale(0.35);
	windowMaterial.emissiveColor = palette.windowGlow.scale(0.7);
	windowMaterial.specularColor = new Color3(0.04, 0.04, 0.04);
	const windowPane = MeshBuilder.CreatePlane(
		`${asset.id}-window-pane`,
		{ width: Math.max(size.width * 0.28, 1.1), height: 1.1 },
		scene,
	);
	windowPane.parent = backgroundRoot;
	windowPane.position = new Vector3(
		-size.width * 0.22,
		1.52,
		size.depth / 2 - 0.01,
	);
	windowPane.rotation = new Vector3(0, Math.PI, 0);
	windowPane.material = windowMaterial;

	const windowFrameMaterial = new StandardMaterial(
		`${asset.id}-window-frame-material`,
		scene,
	);
	windowFrameMaterial.diffuseColor = palette.accent.scale(0.55);
	windowFrameMaterial.emissiveColor = palette.accent.scale(0.04);
	windowFrameMaterial.specularColor = new Color3(0.06, 0.06, 0.06);
	const frameTop = MeshBuilder.CreateBox(
		`${asset.id}-window-frame-top`,
		{ width: Math.max(size.width * 0.32, 1.26), height: 0.06, depth: 0.03 },
		scene,
	);
	frameTop.parent = backgroundRoot;
	frameTop.position = new Vector3(
		-size.width * 0.22,
		2.08,
		size.depth / 2 - 0.015,
	);
	frameTop.material = windowFrameMaterial;

	const frameSide = MeshBuilder.CreateBox(
		`${asset.id}-window-frame-side`,
		{ width: 0.05, height: 1.16, depth: 0.03 },
		scene,
	);
	frameSide.parent = backgroundRoot;
	frameSide.position = new Vector3(
		-size.width * 0.37,
		1.52,
		size.depth / 2 - 0.015,
	);
	frameSide.material = windowFrameMaterial;

	const posterMaterial = new StandardMaterial(
		`${asset.id}-poster-material`,
		scene,
	);
	posterMaterial.diffuseColor = palette.accent.scale(0.6);
	posterMaterial.emissiveColor = palette.accent.scale(0.12);
	posterMaterial.specularColor = new Color3(0.08, 0.08, 0.08);
	const poster = MeshBuilder.CreatePlane(
		`${asset.id}-poster`,
		{ width: Math.max(size.width * 0.22, 0.9), height: 0.7 },
		scene,
	);
	poster.parent = backgroundRoot;
	poster.position = new Vector3(
		size.width * 0.23,
		1.85,
		size.depth / 2 - 0.012,
	);
	poster.rotation = new Vector3(0, Math.PI, 0);
	poster.material = posterMaterial;
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
