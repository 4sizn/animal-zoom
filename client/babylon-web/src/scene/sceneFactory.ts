import {
	ArcRotateCamera,
	Color3,
	type Engine,
	HemisphericLight,
	MeshBuilder,
	Scene,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";

export type SceneFactoryOptions = {
	attachControl?: boolean;
	inputElement?: HTMLElement;
};

export type SceneBundle = {
	scene: Scene;
	camera: ArcRotateCamera;
	dispose: () => void;
};

export function createSingleViewSceneBundle(
	engine: Engine,
	options: SceneFactoryOptions = {},
): SceneBundle {
	const scene = new Scene(engine);
	scene.clearColor.set(0.94, 0.97, 1.0, 1);

	const camera = new ArcRotateCamera(
		"single-view-camera",
		-Math.PI / 2,
		Math.PI / 3,
		8,
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

	const mesh = MeshBuilder.CreateBox(
		"single-view-avatar-proxy",
		{ size: 1.4 },
		scene,
	);
	mesh.position.y = 0.7;

	const meshMaterial = new StandardMaterial(
		"single-view-avatar-proxy-material",
		scene,
	);
	meshMaterial.diffuseColor = new Color3(0.23, 0.48, 0.88);
	mesh.material = meshMaterial;

	return {
		scene,
		camera,
		dispose: () => {
			camera.detachControl();
			scene.dispose();
		},
	};
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

	const meshMaterial = new StandardMaterial(
		`${participantId}-avatar-proxy-material`,
		scene,
	);
	meshMaterial.diffuseColor = new Color3(0.81, 0.47, 0.2);
	mesh.material = meshMaterial;

	return {
		scene,
		camera,
		dispose: () => {
			camera.detachControl();
			scene.dispose();
		},
	};
}
