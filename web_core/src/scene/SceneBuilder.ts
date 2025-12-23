/**
 * Scene builder for constructing Babylon.js scenes from resource configurations
 *
 * Provides methods to build characters and rooms from serialized configurations.
 */

import {
  Scene,
  Mesh,
  Light,
  Vector3,
  StandardMaterial,
  Color3,
  HemisphericLight,
  PointLight,
  MeshBuilder,
} from "@babylonjs/core";
import type { CharacterConfig, RoomConfig } from "../resources/ResourceConfig";

/**
 * Result of building a character mesh with optional accessories
 */
export interface CharacterBuildResult {
  mesh: Mesh;
  accessories?: Mesh[];
}

/**
 * Result of building a room with meshes and lights
 */
export interface RoomBuildResult {
  meshes: Mesh[];
  lights: Light[];
}

/**
 * Builds Babylon.js scenes from resource configurations
 */
export class SceneBuilder {
  /**
   * Builds a character mesh from configuration.
   *
   * @param scene - The Babylon.js scene to add the character to
   * @param config - Character configuration with mesh data and customization
   * @returns Character build result with mesh and optional accessories
   * @throws Error if scene or config is invalid
   */
  static buildCharacter(
    scene: Scene,
    config: CharacterConfig
  ): CharacterBuildResult {
    if (!scene) {
      throw new Error("Invalid scene: scene is required");
    }

    if (!config) {
      throw new Error("Invalid config: config is required");
    }

    if (!config.serializedData) {
      throw new Error("Invalid config: serializedData is required");
    }

    try {
      const meshData = config.serializedData.mesh;

      if (!meshData) {
        throw new Error("No mesh data found in config");
      }

      // Create mesh based on type or use default sphere
      let mesh: Mesh;

      if (meshData.type === "sphere") {
        // Create sphere mesh
        const diameter = meshData.diameter || 2;
        mesh = MeshBuilder.CreateSphere(
          meshData.name || "character",
          { diameter, segments: 16 },
          scene
        );
      } else {
        // For other types or full serialized data, create a sphere as placeholder
        mesh = MeshBuilder.CreateSphere(
          meshData.name || "character",
          { diameter: 2 },
          scene
        );
      }

      // Apply position, rotation, scaling
      if (meshData.position) {
        mesh.position = new Vector3(
          meshData.position[0] || 0,
          meshData.position[1] || 0,
          meshData.position[2] || 0
        );
      }

      if (meshData.rotation) {
        mesh.rotation = new Vector3(
          meshData.rotation[0] || 0,
          meshData.rotation[1] || 0,
          meshData.rotation[2] || 0
        );
      }

      if (meshData.scaling) {
        mesh.scaling = new Vector3(
          meshData.scaling[0] || 1,
          meshData.scaling[1] || 1,
          meshData.scaling[2] || 1
        );
      }

      // Apply customization (colors, materials)
      if (config.customization?.colors) {
        const material = new StandardMaterial(
          `${mesh.name}_material`,
          scene
        );

        // Apply primary color if available
        if (config.customization.colors.primary) {
          const color = this.hexToColor3(
            config.customization.colors.primary
          );
          material.diffuseColor = color;
        }

        mesh.material = material;
      }

      // Handle accessories (placeholder implementation)
      let accessories: Mesh[] | undefined;
      if (
        config.customization?.accessories &&
        config.customization.accessories.length > 0
      ) {
        // Placeholder: accessories would be loaded/created here
        // For now, return empty array to indicate accessory support
        accessories = [];
      }

      return {
        mesh,
        accessories,
      };
    } catch (error) {
      throw new Error(`Failed to build character: ${error}`);
    }
  }

  /**
   * Builds a room with environment meshes and lighting from configuration.
   *
   * @param scene - The Babylon.js scene to add the room to
   * @param config - Room configuration with environment and lighting data
   * @returns Room build result with meshes and lights
   * @throws Error if scene or config is invalid
   */
  static buildRoom(scene: Scene, config: RoomConfig): RoomBuildResult {
    if (!scene) {
      throw new Error("Invalid scene: scene is required");
    }

    if (!config) {
      throw new Error("Invalid config: config is required");
    }

    const meshes: Mesh[] = [];
    const lights: Light[] = [];

    try {
      // Build meshes from serialized data
      if (config.serializedData?.meshes) {
        for (const meshData of config.serializedData.meshes) {
          let mesh: Mesh;

          if (meshData.type === "ground") {
            // Create ground plane
            const width = meshData.width || 10;
            const height = meshData.height || 10;
            mesh = MeshBuilder.CreateGround(
              meshData.name || "ground",
              { width, height },
              scene
            );

            // Apply floor material if available
            if (config.environment?.floorMaterial) {
              const material = new StandardMaterial(
                `${mesh.name}_material`,
                scene
              );
              if (config.environment.floorMaterial.color) {
                material.diffuseColor = this.hexToColor3(
                  config.environment.floorMaterial.color
                );
              }
              mesh.material = material;
            }
          } else {
            // Create a default box for other types
            mesh = MeshBuilder.CreateBox(
              meshData.name || "mesh",
              { size: 1 },
              scene
            );
          }

          meshes.push(mesh);
        }
      }

      // Apply lighting preset
      if (config.lighting?.preset) {
        const presetLights = this.createLightingPreset(
          scene,
          config.lighting.preset
        );
        lights.push(...presetLights);
      }

      // Add custom lights
      if (config.lighting?.customLights) {
        for (const lightData of config.lighting.customLights) {
          let light: Light;

          if (lightData.type === "point") {
            light = new PointLight(
              lightData.name || "pointLight",
              new Vector3(
                lightData.position?.[0] || 0,
                lightData.position?.[1] || 5,
                lightData.position?.[2] || 0
              ),
              scene
            );
            light.intensity = lightData.intensity || 1.0;
          } else {
            // Default to hemispheric
            light = new HemisphericLight(
              lightData.name || "light",
              new Vector3(0, 1, 0),
              scene
            );
            light.intensity = lightData.intensity || 0.7;
          }

          lights.push(light);
        }
      }

      // If no lights were created, add a default light
      if (lights.length === 0) {
        const defaultLight = new HemisphericLight(
          "defaultLight",
          new Vector3(0, 1, 0),
          scene
        );
        defaultLight.intensity = 0.7;
        lights.push(defaultLight);
      }

      return { meshes, lights };
    } catch (error) {
      throw new Error(`Failed to build room: ${error}`);
    }
  }

  /**
   * Creates lighting based on preset name.
   *
   * @param scene - The scene to add lights to
   * @param preset - Preset name (default, bright, dim, dramatic)
   * @returns Array of created lights
   */
  static createLightingPreset(scene: Scene, preset: string): Light[] {
    const lights: Light[] = [];

    switch (preset) {
      case "bright":
        // Bright preset: strong hemispheric light
        const brightLight = new HemisphericLight(
          "brightLight",
          new Vector3(0, 1, 0),
          scene
        );
        brightLight.intensity = 1.2;
        lights.push(brightLight);
        break;

      case "dim":
        // Dim preset: low intensity light
        const dimLight = new HemisphericLight(
          "dimLight",
          new Vector3(0, 1, 0),
          scene
        );
        dimLight.intensity = 0.4;
        lights.push(dimLight);
        break;

      case "dramatic":
        // Dramatic preset: directional with strong shadows
        const dramaticMain = new HemisphericLight(
          "dramaticMain",
          new Vector3(1, 1, 0),
          scene
        );
        dramaticMain.intensity = 0.8;

        const dramaticFill = new PointLight(
          "dramaticFill",
          new Vector3(-5, 3, -5),
          scene
        );
        dramaticFill.intensity = 0.3;

        lights.push(dramaticMain, dramaticFill);
        break;

      case "default":
      default:
        // Default preset: standard hemispheric
        const defaultLight = new HemisphericLight(
          "defaultLight",
          new Vector3(0, 1, 0),
          scene
        );
        defaultLight.intensity = 0.7;
        lights.push(defaultLight);
        break;
    }

    return lights;
  }

  /**
   * Converts hex color string to Babylon.js Color3.
   *
   * @param hex - Hex color string (e.g., "#ff0000")
   * @returns Color3 object
   */
  private static hexToColor3(hex: string): Color3 {
    // Remove # if present
    hex = hex.replace("#", "");

    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    return new Color3(r, g, b);
  }
}

