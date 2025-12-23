/**
 * Default resource configurations for new participants
 *
 * Provides factory methods for creating default character and room configurations.
 */

import type { ParticipantResourceConfig } from "./ResourceConfig";

const VERSION = "1.0.0";

/**
 * Factory for creating default resource configurations.
 */
export class DefaultConfigs {
  /**
   * Creates a default character configuration with a basic sphere mesh.
   *
   * @param participantId - The participant's unique identifier
   * @returns Default character configuration
   */
  static getDefaultCharacterConfig(
    participantId: string
  ): ParticipantResourceConfig {
    return {
      version: VERSION,
      participantId,
      timestamp: Date.now(),
      character: {
        modelUrl: "https://example.com/default-character.glb",
        serializedData: {
          mesh: {
            name: "character",
            type: "sphere",
            diameter: 2,
            segments: 16,
          },
          material: {
            name: "characterMat",
            diffuseColor: [0.5, 0.5, 1.0], // Light blue
          },
        },
        customization: {
          colors: {
            primary: "#8080ff",
            secondary: "#ffffff",
          },
          accessories: [],
          animations: ["idle"],
        },
      },
      room: {
        serializedData: {},
        environment: {},
        lighting: {
          preset: "default",
          customLights: [],
        },
      },
    };
  }

  /**
   * Creates a default room configuration with basic ground and lighting.
   *
   * @param participantId - The participant's unique identifier
   * @returns Default room configuration
   */
  static getDefaultRoomConfig(
    participantId: string
  ): ParticipantResourceConfig {
    return {
      version: VERSION,
      participantId,
      timestamp: Date.now(),
      character: {
        modelUrl: "",
        serializedData: {},
        customization: {},
      },
      room: {
        serializedData: {
          meshes: [
            {
              name: "ground",
              type: "ground",
              width: 10,
              height: 10,
              subdivisions: 2,
            },
          ],
          lights: [
            {
              name: "light",
              type: "hemispheric",
              direction: [0, 1, 0],
              intensity: 0.7,
            },
          ],
        },
        environment: {
          furniture: [],
          decorations: [],
          wallMaterial: {
            color: "#f5f5f5",
            texture: null,
          },
          floorMaterial: {
            color: "#e0e0e0",
            texture: null,
          },
        },
        lighting: {
          preset: "bright",
          customLights: [],
        },
      },
    };
  }

  /**
   * Creates a complete default configuration with both character and room.
   *
   * @param participantId - The participant's unique identifier
   * @returns Complete default configuration
   */
  static getDefaultFullConfig(
    participantId: string
  ): ParticipantResourceConfig {
    return {
      version: VERSION,
      participantId,
      timestamp: Date.now(),
      character: {
        modelUrl: "https://example.com/default-character.glb",
        serializedData: {
          mesh: {
            name: "character",
            type: "sphere",
            diameter: 2,
            segments: 16,
          },
          material: {
            name: "characterMat",
            diffuseColor: [0.5, 0.5, 1.0],
          },
        },
        customization: {
          colors: {
            primary: "#8080ff",
            secondary: "#ffffff",
          },
          accessories: [],
          animations: ["idle"],
        },
      },
      room: {
        serializedData: {
          meshes: [
            {
              name: "ground",
              type: "ground",
              width: 10,
              height: 10,
              subdivisions: 2,
            },
          ],
          lights: [
            {
              name: "light",
              type: "hemispheric",
              direction: [0, 1, 0],
              intensity: 0.7,
            },
          ],
        },
        environment: {
          furniture: [],
          decorations: [],
          wallMaterial: {
            color: "#f5f5f5",
            texture: null,
          },
          floorMaterial: {
            color: "#e0e0e0",
            texture: null,
          },
        },
        lighting: {
          preset: "bright",
          customLights: [],
        },
      },
    };
  }
}
