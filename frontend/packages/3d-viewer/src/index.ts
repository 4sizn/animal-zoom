/**
 * 3D Viewer Package
 * Babylon.js-based 3D rendering engine for Animal Zoom
 */

export { SceneBuilder } from './scene/SceneBuilder';
export { ParticipantManager } from './scene/ParticipantManager';

// Resource management
export { ResourceStorage } from './resources/ResourceStorage';
export { ResourceLoader } from './resources/ResourceLoader';
export { ResourceStorageAPI } from './resources/ResourceStorageAPI';
export { AssetUrlResolver } from './resources/AssetUrlResolver';
export { DefaultConfigs } from './resources/DefaultConfigs';
export type { IResourceStorage } from './resources/IResourceStorage';
export type { ResourceConfig } from './resources/ResourceConfig';

/**
 * Create a 3D viewer instance
 * @param canvas - HTMLCanvasElement for rendering
 * @returns SceneBuilder instance
 */
export function createViewer(canvas: HTMLCanvasElement) {
  return new SceneBuilder(canvas);
}
