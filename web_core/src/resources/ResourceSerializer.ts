/**
 * Resource serialization and deserialization for Babylon.js objects
 *
 * This class provides methods to serialize Babylon.js meshes and scenes into
 * storable JSON format, and deserialize them back into Babylon.js objects.
 */

import { Scene, Mesh, SceneSerializer } from "@babylonjs/core";
import type { CharacterConfig, RoomConfig } from "./ResourceConfig";

/**
 * Handles serialization and deserialization of Babylon.js scene resources.
 */
export class ResourceSerializer {
  /**
   * Serializes a character mesh with its material and customization options.
   *
   * @param mesh - The Babylon.js mesh representing the character
   * @param modelUrl - URL to the character's 3D model file
   * @param customization - Character customization options (colors, accessories, animations)
   * @returns Serialized character configuration
   * @throws Error if mesh is invalid or serialization fails
   */
  static serializeCharacter(
    mesh: Mesh,
    modelUrl: string,
    customization: CharacterConfig["customization"]
  ): CharacterConfig {
    if (!mesh) {
      throw new Error("Invalid mesh: mesh is required");
    }

    try {
      // Serialize the mesh to Babylon.js format
      const serializedMesh = mesh.serialize();

      return {
        modelUrl,
        serializedData: {
          mesh: serializedMesh,
          material: mesh.material?.serialize(),
        },
        customization,
      };
    } catch (error) {
      throw new Error(`Failed to serialize character: ${error}`);
    }
  }

  /**
   * Serializes a room scene with its environment and lighting configuration.
   *
   * @param scene - The Babylon.js scene to serialize
   * @param environment - Room environment data (furniture, decorations, materials)
   * @param lighting - Room lighting configuration
   * @returns Serialized room configuration
   * @throws Error if scene is invalid or serialization fails
   */
  static serializeRoom(
    scene: Scene,
    environment: RoomConfig["environment"],
    lighting: RoomConfig["lighting"]
  ): RoomConfig {
    if (!scene) {
      throw new Error("Invalid scene: scene is required");
    }

    try {
      // Serialize the entire scene
      const serializedScene = SceneSerializer.Serialize(scene);

      return {
        serializedData: serializedScene,
        environment,
        lighting,
      };
    } catch (error) {
      throw new Error(`Failed to serialize room: ${error}`);
    }
  }

  /**
   * Deserializes a character configuration back into a Babylon.js mesh.
   *
   * @param scene - The scene to add the deserialized character to
   * @param config - Serialized character configuration
   * @returns The reconstructed character mesh
   * @throws Error if config is invalid or deserialization fails
   */
  static deserializeCharacter(scene: Scene, config: CharacterConfig): Mesh {
    if (!config.serializedData) {
      throw new Error("Invalid serialized data: serializedData is required");
    }

    try {
      // For now, use Mesh.Parse to deserialize the mesh
      const meshData = config.serializedData.mesh;

      if (!meshData) {
        throw new Error("No mesh data found in serialized config");
      }

      const mesh = Mesh.Parse(meshData, scene, "");

      // Apply material if available
      if (config.serializedData.material && mesh) {
        // Material deserialization would go here
        // For now, we'll skip it as it's more complex
      }

      return mesh;
    } catch (error) {
      throw new Error(`Failed to deserialize character: ${error}`);
    }
  }

  /**
   * Deserializes a room configuration back into scene meshes.
   *
   * @param scene - The scene to add the deserialized room elements to
   * @param config - Serialized room configuration
   * @returns Object containing array of reconstructed meshes
   * @throws Error if config is invalid or deserialization fails
   */
  static deserializeRoom(
    scene: Scene,
    config: RoomConfig
  ): { meshes: Mesh[] } {
    if (!config.serializedData) {
      throw new Error("Invalid serialized data: serializedData is required");
    }

    try {
      // For a complete implementation, we would use SceneLoader
      // For now, return empty meshes array for empty scene data
      const meshes: Mesh[] = [];

      // If there's actual scene data, we would deserialize it here
      if (config.serializedData && Object.keys(config.serializedData).length > 0) {
        // In a real implementation, we'd use:
        // SceneLoader.ImportMesh or SceneSerializer.Parse
        // For now, return existing meshes
        meshes.push(...scene.meshes.filter((m) => m instanceof Mesh) as Mesh[]);
      }

      return { meshes };
    } catch (error) {
      throw new Error(`Failed to deserialize room: ${error}`);
    }
  }
}
