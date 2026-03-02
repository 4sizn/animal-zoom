import type { AbstractMesh, Scene } from "@babylonjs/core";
import {
	Color3,
	MeshBuilder,
	SceneLoader,
	StandardMaterial,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export type AvatarType = "apollo" | "villager_oc" | "macchiato" | "molly_duck";

const AVATAR_ROOT_URL_BY_TYPE: Record<AvatarType, string> = {
	apollo: "/assets/characters/apollo/",
	villager_oc: "/assets/characters/villager_oc/",
	macchiato: "/assets/characters/macchiato/",
	molly_duck: "/assets/characters/molly_duck/",
};

type LoadCharacterOptions = {
	proxyName?: string;
	proxyColor?: Color3;
};

export async function loadCharacterByAvatarType(
	scene: Scene,
	avatarType: AvatarType,
	options: LoadCharacterOptions = {},
): Promise<AbstractMesh[]> {
	const rootUrl = AVATAR_ROOT_URL_BY_TYPE[avatarType];

	try {
		const result = await SceneLoader.ImportMeshAsync(
			"",
			rootUrl,
			"scene.gltf",
			scene,
		);

		if (result.meshes.length > 0) {
			return result.meshes;
		}
	} catch (error) {
		console.error(`Failed to load avatar glTF (${avatarType})`, error);
	}

	return createFallbackProxyMeshes(scene, options);
}

function createFallbackProxyMeshes(
	scene: Scene,
	options: LoadCharacterOptions,
): AbstractMesh[] {
	const proxyName = options.proxyName ?? "avatar-proxy";
	const proxyColor = options.proxyColor ?? new Color3(1, 0.2, 0.55);
	const material = new StandardMaterial(
		`${proxyName}-material-${scene.getUniqueId()}`,
		scene,
	);
	material.diffuseColor = proxyColor;

	const body = MeshBuilder.CreateCylinder(
		`${proxyName}-body`,
		{ diameter: 1, height: 1.4 },
		scene,
	);
	body.position.y = 0.7;
	body.material = material;

	const head = MeshBuilder.CreateSphere(
		`${proxyName}-head`,
		{ diameter: 0.7 },
		scene,
	);
	head.position.y = 1.6;
	head.material = material;

	return [body, head];
}
