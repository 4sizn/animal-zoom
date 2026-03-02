import { Vector3 } from "@babylonjs/core";

export type GridCellSize = {
	width: number;
	depth: number;
};

export function generateGridPositions(
	count: number,
	cellSize: GridCellSize,
	spacing: number,
): Vector3[] {
	if (count <= 0) {
		return [];
	}

	const columns = Math.ceil(Math.sqrt(count));
	const rows = Math.ceil(count / columns);
	const originX = -((columns - 1) * (cellSize.width + spacing)) / 2;
	const originZ = -((rows - 1) * (cellSize.depth + spacing)) / 2;
	const positions: Vector3[] = [];

	for (let index = 0; index < count; index += 1) {
		const column = index % columns;
		const row = Math.floor(index / columns);
		positions.push(
			new Vector3(
				originX + column * (cellSize.width + spacing),
				0,
				originZ + row * (cellSize.depth + spacing),
			),
		);
	}

	return positions;
}
