/**
 * 3D Viewer Package
 * Babylon.js-based 3D rendering engine for Animal Zoom
 */

export { AssetUrlResolver } from "./resources/AssetUrlResolver";
export { DefaultConfigs } from "./resources/DefaultConfigs";
export type { IResourceStorage } from "./resources/IResourceStorage";
export type { ResourceConfig } from "./resources/ResourceConfig";
export { ResourceLoader } from "./resources/ResourceLoader";
// Resource management
export { ResourceStorage } from "./resources/ResourceStorage";
export { ResourceStorageAPI } from "./resources/ResourceStorageAPI";
export { ParticipantManager } from "./scene/ParticipantManager";
export { SceneBuilder } from "./scene/SceneBuilder";

/**
 * Create a 3D viewer instance
 * @param canvas - HTMLCanvasElement for rendering
 * @returns SceneBuilder instance
 */
export function createViewer(canvas: HTMLCanvasElement) {
  return new SceneBuilder(canvas);
}
