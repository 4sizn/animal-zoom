/**
 * ParticipantManager - Multi-Canvas Management for Babylon.js
 * Manages multiple participants, each with their own canvas and 3D scene
 * Based on design-specification.md section 8.4
 *
 * Updated to use ResourceLoader and SceneBuilder for character/room management
 */

import * as BABYLON from "@babylonjs/core";
import type { ResourceLoader } from "../resources/ResourceLoader";
import { SceneBuilder } from "./SceneBuilder";

export interface Participant {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  character?: BABYLON.AbstractMesh;
  isMuted: boolean;
  cameraOff: boolean;
}

export class ParticipantManager {
  private engine: BABYLON.Engine | BABYLON.NullEngine;
  private participants: Map<string, Participant> = new Map();
  private gridContainer: HTMLElement | null;
  private participantCountElement: HTMLElement | null;
  private resourceLoader: ResourceLoader;

  constructor(
    primaryCanvas: HTMLCanvasElement,
    resourceLoader: ResourceLoader,
    engine?: BABYLON.Engine | BABYLON.NullEngine,
  ) {
    // Use provided engine for testing, or create new one
    if (engine) {
      this.engine = engine;
    } else {
      // Single engine instance for all scenes
      this.engine = new BABYLON.Engine(primaryCanvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        powerPreference: "high-performance",
      });
    }

    this.resourceLoader = resourceLoader;
    this.gridContainer = document.querySelector(".participant-grid");
    this.participantCountElement = document.getElementById("participant-count");

    // Initialize participant count display
    this.updateParticipantCount();

    this.setupResizeHandler();
  }

  /**
   * Add a new participant to the meeting
   * Now uses ResourceLoader and SceneBuilder for character/room setup
   */
  async addParticipant(id: string, name: string): Promise<Participant> {
    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.id = `canvas-${id}`;
    canvas.className = "participant-canvas";

    // Create a separate engine for this participant
    const participantEngine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      powerPreference: "high-performance",
    });

    // Create scene with the participant's engine
    const scene = new BABYLON.Scene(participantEngine);
    scene.clearColor = new BABYLON.Color4(0.16, 0.15, 0.14, 1); // #2a2624

    // Create camera
    const camera = this.createCamera(id, scene);

    // Setup lighting
    this.setupLighting(scene);

    // Create participant object
    const participant: Participant = {
      id,
      name,
      canvas,
      engine: participantEngine,
      scene,
      camera,
      isMuted: false,
      cameraOff: false,
    };

    // Load character model using ResourceLoader and SceneBuilder
    await this.loadCharacterModel(participant);

    // Store participant
    this.participants.set(id, participant);

    // Start render loop for this participant
    participant.engine.runRenderLoop(() => {
      if (!participant.cameraOff && participant.scene) {
        participant.scene.render();
      }
    });

    // Add to DOM
    this.addParticipantToGrid(participant);

    // Update participant count
    this.updateParticipantCount();

    return participant;
  }

  /**
   * Remove a participant from the meeting
   */
  removeParticipant(participantId: string): void {
    const participant = this.participants.get(participantId);
    if (!participant) return;

    // Dispose scene and engine
    participant.scene.dispose();
    participant.engine.dispose();

    // Remove from DOM
    const cell = document.querySelector(
      `[data-participant-id="${participantId}"]`,
    );
    cell?.remove();

    // Remove from map
    this.participants.delete(participantId);

    // Update grid layout and participant count
    this.updateGridLayout();
    this.updateParticipantCount();
  }

  /**
   * Create camera for participant scene
   */
  private createCamera(
    id: string,
    scene: BABYLON.Scene,
  ): BABYLON.ArcRotateCamera {
    const camera = new BABYLON.ArcRotateCamera(
      `camera-${id}`,
      Math.PI / 2, // Alpha: 90 degrees
      Math.PI / 3, // Beta: 60 degrees
      3.5, // Radius: 3.5 units
      new BABYLON.Vector3(0, 1.2, 0), // Target: chest level
      scene,
    );

    camera.fov = 0.8; // ~45 degrees
    camera.lowerRadiusLimit = 2.5;
    camera.upperRadiusLimit = 5.0;
    camera.lowerBetaLimit = Math.PI / 4;
    camera.upperBetaLimit = Math.PI / 2.2;

    // Disable user control in grid view
    camera.attachControl(
      camera.getScene().getEngine().getRenderingCanvas()!,
      false,
    );

    return camera;
  }

  /**
   * Setup three-point lighting system
   */
  private setupLighting(scene: BABYLON.Scene): void {
    // 1. Key Light (Main light source)
    const keyLight = new BABYLON.DirectionalLight(
      "keyLight",
      new BABYLON.Vector3(-1, -2, -1),
      scene,
    );
    keyLight.position = new BABYLON.Vector3(2, 3, 2);
    keyLight.intensity = 0.8;
    keyLight.diffuse = new BABYLON.Color3(1, 0.98, 0.9); // Warm white

    // 2. Fill Light (Soften shadows)
    const fillLight = new BABYLON.HemisphericLight(
      "fillLight",
      new BABYLON.Vector3(0, 1, 0),
      scene,
    );
    fillLight.intensity = 0.5;
    fillLight.diffuse = new BABYLON.Color3(0.96, 0.9, 0.85); // Warm ambient
    fillLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.35);

    // 3. Rim Light (Separation from background)
    const rimLight = new BABYLON.SpotLight(
      "rimLight",
      new BABYLON.Vector3(0, 2, -2),
      new BABYLON.Vector3(0, -1, 1),
      Math.PI / 3,
      2,
      scene,
    );
    rimLight.intensity = 0.4;
    rimLight.diffuse = new BABYLON.Color3(0.9, 0.95, 1); // Cool highlight

    // Ambient light
    scene.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.25);
  }

  /**
   * Load character model using ResourceLoader and SceneBuilder
   */
  private async loadCharacterModel(participant: Participant): Promise<void> {
    try {
      // Load participant config (uses cache or loads from storage)
      const config = await this.resourceLoader.loadParticipantConfig(
        participant.id,
      );

      // Build character using SceneBuilder
      const characterResult = await SceneBuilder.buildCharacter(
        participant.scene,
        config.character,
      );

      participant.character = characterResult.mesh;

      // Position character at chest level
      if (!config.character.serializedData?.mesh?.position) {
        participant.character.position.y = 1.2;
      }

      // Add simple animation for visual feedback
      participant.scene.registerBeforeRender(() => {
        if (participant.character && !participant.character.isDisposed()) {
          participant.character.rotation.y += 0.005;
        }
      });
    } catch (error) {
      console.error(`Failed to load character for ${participant.name}:`, error);

      // Fallback: Create a simple placeholder
      const sphere = BABYLON.MeshBuilder.CreateSphere(
        `character-${participant.id}`,
        { diameter: 1, segments: 32 },
        participant.scene,
      );
      sphere.position.y = 1.2;

      const material = new BABYLON.StandardMaterial(
        `mat-${participant.id}`,
        participant.scene,
      );
      material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Gray fallback
      sphere.material = material;

      participant.character = sphere;
    }
  }

  /**
   * Add participant cell to the grid
   */
  private addParticipantToGrid(participant: Participant): void {
    if (!this.gridContainer) return;

    // Create cell wrapper
    const cell = document.createElement("div");
    cell.className = "participant-cell";
    cell.dataset.participantId = participant.id;

    // Add canvas
    cell.appendChild(participant.canvas);

    // Add overlay with name label
    const overlay = document.createElement("div");
    overlay.className = "participant-overlay";

    const nameLabel = document.createElement("span");
    nameLabel.className = "participant-name";
    nameLabel.textContent = participant.name;

    // Add indicators container
    const indicators = document.createElement("div");
    indicators.className = "participant-indicators";

    // Muted indicator
    const mutedIndicator = document.createElement("div");
    mutedIndicator.className = "muted-indicator";
    mutedIndicator.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 9.4V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14C12.55 14 13.06 13.85 13.5 13.6L15 15.1C14.13 15.67 13.11 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C13.91 17.81 14.77 17.51 15.54 17.07L15 9.4ZM17 11C17 11.2 16.99 11.4 16.97 11.59L18.54 13.16C18.83 12.47 19 11.75 19 11H17ZM1 1L23 23L21.5 24.5L0.5 3.5L1 1Z" fill="currentColor" stroke="currentColor" stroke-width="0.5"/>
      </svg>
    `;

    indicators.appendChild(mutedIndicator);
    overlay.appendChild(nameLabel);
    overlay.appendChild(indicators);

    cell.appendChild(overlay);

    // Add to grid
    this.gridContainer.appendChild(cell);

    // Update grid layout
    this.updateGridLayout();
  }

  /**
   * Update grid layout based on participant count
   */
  private updateGridLayout(): void {
    if (!this.gridContainer) return;

    const count = this.participants.size;
    let gridSize: string;

    if (count <= 1) {
      gridSize = "1x1";
    } else if (count <= 4) {
      gridSize = "2x2";
    } else if (count <= 9) {
      gridSize = "3x3";
    } else {
      gridSize = "4x4";
    }

    this.gridContainer.dataset.gridSize = gridSize;
  }

  /**
   * Update participant count display
   */
  private updateParticipantCount(): void {
    if (!this.participantCountElement) return;

    const count = this.participants.size;
    this.participantCountElement.textContent = `${count} participant${count !== 1 ? "s" : ""}`;
  }

  /**
   * Setup window resize handler
   */
  private setupResizeHandler(): void {
    window.addEventListener("resize", () => {
      this.participants.forEach((participant) => {
        participant.engine.resize();
      });
    });
  }

  /**
   * Set active speaker (visual indicator)
   */
  setActiveSpeaker(participantId: string): void {
    // Remove active speaker from all
    this.participants.forEach((p) => {
      const cell = document.querySelector(`[data-participant-id="${p.id}"]`);
      cell?.classList.remove("active-speaker");
    });

    // Add to specified participant
    const cell = document.querySelector(
      `[data-participant-id="${participantId}"]`,
    );
    cell?.classList.add("active-speaker");
  }

  /**
   * Toggle mute state for a participant
   */
  toggleMute(participantId: string): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.isMuted = !participant.isMuted;
      const cell = document.querySelector(
        `[data-participant-id="${participantId}"]`,
      );
      cell?.classList.toggle("muted", participant.isMuted);
    }
  }

  /**
   * Toggle camera state for a participant
   */
  toggleCamera(participantId: string): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.cameraOff = !participant.cameraOff;
      const cell = document.querySelector(
        `[data-participant-id="${participantId}"]`,
      );
      cell?.classList.toggle("camera-off", participant.cameraOff);
    }
  }

  /**
   * Get all participants
   */
  getParticipants(): Map<string, Participant> {
    return this.participants;
  }

  /**
   * Get participant by ID
   */
  getParticipant(participantId: string): Participant | undefined {
    return this.participants.get(participantId);
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.participants.forEach((participant) => {
      participant.scene.dispose();
    });
    this.participants.clear();
    this.engine.dispose();
  }
}

export default ParticipantManager;
