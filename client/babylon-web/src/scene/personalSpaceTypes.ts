export type Vector3Like = {
	x: number;
	y: number;
	z: number;
};

export type PersonalSpaceSize = {
	width: number;
	depth: number;
};

export type AssetType = "avatar" | "mesh" | "light" | "background" | "ui";

export type AssetSpecBase = {
	type: AssetType;
	key: string;
	id: string;
	position: Vector3Like;
	rotation: Vector3Like;
	scale: Vector3Like;
	options?: Record<string, unknown>;
};

export type AvatarAssetSpec = AssetSpecBase & {
	type: "avatar";
	avatarType?: string;
};

export type AssetSpec = AssetSpecBase | AvatarAssetSpec;

export type PersonalSpace = {
	id: string;
	name: string;
	theme?: string;
	position?: Vector3Like;
	size?: PersonalSpaceSize;
	assets: AssetSpec[];
};
