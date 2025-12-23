/**
 * EditMyRoom - Room editor scene
 * Full-screen editor for customizing participant's room environment
 */

import * as BABYLON from "@babylonjs/core";
import { EditorBase, type EditorOptions } from "./EditorBase";
import type { ResourceLoader } from "../resources/ResourceLoader";
import { SceneBuilder } from "../scene/SceneBuilder";
import type { ParticipantResourceConfig } from "../resources/ResourceConfig";

/**
 * Room editor for customizing environment
 */
export class EditMyRoom extends EditorBase {
  private roomMeshes: BABYLON.AbstractMesh[] = [];
  private currentConfig?: ParticipantResourceConfig;
  private lightingPreset: string = "default";
  private wallColor: string = "#f5f5f5";
  private floorColor: string = "#e0e0e0";
  private furniture: string[] = [];
  private ground?: BABYLON.AbstractMesh;

  constructor(
    canvas: HTMLCanvasElement,
    resourceLoader: ResourceLoader,
    participantId: string,
    engine?: BABYLON.Engine | BABYLON.NullEngine,
    options: EditorOptions = {}
  ) {
    super(canvas, resourceLoader, participantId, engine, options);

    // Create initial room structure
    this.createInitialRoom();
  }

  /**
   * Setup camera for room viewing
   */
  protected setupCamera(): void {
    this.camera = new BABYLON.ArcRotateCamera(
      "roomCamera",
      -Math.PI / 2, // Alpha: side view
      Math.PI / 4, // Beta: 45 degrees
      15, // Radius: further back for room overview
      new BABYLON.Vector3(0, 0, 0), // Target: center of room
      this.scene
    );

    this.camera.fov = 1.0; // Wider field of view for room
    this.camera.lowerRadiusLimit = 8;
    this.camera.upperRadiusLimit = 30;
    this.camera.lowerBetaLimit = Math.PI / 8;
    this.camera.upperBetaLimit = Math.PI / 2.2;

    // Enable user control for viewing room
    this.camera.attachControl(this.scene.getEngine().getRenderingCanvas()!, true);
  }

  /**
   * Setup lighting for room (initial default)
   */
  protected setupLighting(): void {
    // Initial lighting will be replaced when preset is applied
    const defaultLight = new BABYLON.HemisphericLight(
      "defaultLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    defaultLight.intensity = 0.7;
  }

  /**
   * Create initial room structure
   */
  private createInitialRoom(): void {
    // Create ground
    this.ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 20, height: 20 },
      this.scene
    );

    const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
    groundMat.diffuseColor = this.hexToColor3(this.floorColor);
    this.ground.material = groundMat;

    this.roomMeshes.push(this.ground);

    // Create walls (simple boxes for now)
    this.createWalls();
  }

  /**
   * Create walls for the room
   */
  private createWalls(): void {
    const wallHeight = 5;
    const roomSize = 20;

    // Back wall
    const backWall = BABYLON.MeshBuilder.CreateBox(
      "backWall",
      { width: roomSize, height: wallHeight, depth: 0.5 },
      this.scene
    );
    backWall.position.z = -roomSize / 2;
    backWall.position.y = wallHeight / 2;

    // Left wall
    const leftWall = BABYLON.MeshBuilder.CreateBox(
      "leftWall",
      { width: 0.5, height: wallHeight, depth: roomSize },
      this.scene
    );
    leftWall.position.x = -roomSize / 2;
    leftWall.position.y = wallHeight / 2;

    // Right wall
    const rightWall = BABYLON.MeshBuilder.CreateBox(
      "rightWall",
      { width: 0.5, height: wallHeight, depth: roomSize },
      this.scene
    );
    rightWall.position.x = roomSize / 2;
    rightWall.position.y = wallHeight / 2;

    // Apply wall materials
    const wallMat = new BABYLON.StandardMaterial("wallMat", this.scene);
    wallMat.diffuseColor = this.hexToColor3(this.wallColor);
    backWall.material = wallMat;
    leftWall.material = wallMat.clone("leftWallMat");
    rightWall.material = wallMat.clone("rightWallMat");

    this.roomMeshes.push(backWall, leftWall, rightWall);
  }

  /**
   * Load room from config
   */
  async loadRoom(): Promise<void> {
    try {
      // Load config
      this.currentConfig = await this.resourceLoader.loadParticipantConfig(
        this.participantId
      );

      // Load room settings from config
      if (this.currentConfig.room.lighting?.preset) {
        this.lightingPreset = this.currentConfig.room.lighting.preset;
        this.applyLightingPreset();
      }

      if (this.currentConfig.room.environment?.wallMaterial?.color) {
        this.wallColor = this.currentConfig.room.environment.wallMaterial.color;
        this.applyWallColor();
      }

      if (this.currentConfig.room.environment?.floorMaterial?.color) {
        this.floorColor = this.currentConfig.room.environment.floorMaterial.color;
        this.applyFloorColor();
      }

      if (this.currentConfig.room.environment?.furniture) {
        this.furniture = [...this.currentConfig.room.environment.furniture];
      }

      // Build room using SceneBuilder if there's serialized data
      if (this.currentConfig.room.serializedData?.meshes) {
        SceneBuilder.buildRoom(this.scene, this.currentConfig.room);
        // Note: We keep our manually created room, but could replace with SceneBuilder meshes
      }
    } catch (error) {
      console.error("Failed to load room:", error);
      // Use defaults already set in constructor
    }
  }

  /**
   * Get room meshes
   */
  getRoomMeshes(): BABYLON.AbstractMesh[] {
    return [...this.roomMeshes];
  }

  /**
   * Get lighting preset
   */
  getLightingPreset(): string {
    return this.lightingPreset;
  }

  /**
   * Set lighting preset
   */
  setLightingPreset(preset: string): void {
    this.lightingPreset = preset;
    this.applyLightingPreset();
  }

  /**
   * Apply lighting preset to scene
   */
  private applyLightingPreset(): void {
    // Remove existing lights
    const lights = [...this.scene.lights];
    lights.forEach((light) => light.dispose());

    // Apply new preset (lights are automatically added to scene)
    SceneBuilder.createLightingPreset(this.scene, this.lightingPreset);
  }

  /**
   * Get wall color
   */
  getWallColor(): string {
    return this.wallColor;
  }

  /**
   * Set wall color
   */
  setWallColor(color: string): void {
    this.wallColor = color;
    this.applyWallColor();
  }

  /**
   * Apply wall color to wall meshes
   */
  private applyWallColor(): void {
    const color3 = this.hexToColor3(this.wallColor);

    // Find and update wall meshes
    const walls = ["backWall", "leftWall", "rightWall"];
    walls.forEach((wallName) => {
      const wall = this.scene.getMeshByName(wallName);
      if (wall && wall.material) {
        const mat = wall.material as BABYLON.StandardMaterial;
        mat.diffuseColor = color3;
      }
    });
  }

  /**
   * Get floor color
   */
  getFloorColor(): string {
    return this.floorColor;
  }

  /**
   * Set floor color
   */
  setFloorColor(color: string): void {
    this.floorColor = color;
    this.applyFloorColor();
  }

  /**
   * Apply floor color to ground mesh
   */
  private applyFloorColor(): void {
    if (this.ground && this.ground.material) {
      const mat = this.ground.material as BABYLON.StandardMaterial;
      mat.diffuseColor = this.hexToColor3(this.floorColor);
    }
  }

  /**
   * Convert hex color to Babylon Color3
   */
  private hexToColor3(hex: string): BABYLON.Color3 {
    const sanitized = hex.replace("#", "");
    const r = parseInt(sanitized.substring(0, 2), 16) / 255;
    const g = parseInt(sanitized.substring(2, 4), 16) / 255;
    const b = parseInt(sanitized.substring(4, 6), 16) / 255;
    return new BABYLON.Color3(r, g, b);
  }

  /**
   * Get furniture list
   */
  getFurniture(): string[] {
    return [...this.furniture];
  }

  /**
   * Add furniture item
   */
  addFurniture(item: string): void {
    this.furniture.push(item);
  }

  /**
   * Remove furniture item
   */
  removeFurniture(item: string): void {
    const index = this.furniture.indexOf(item);
    if (index !== -1) {
      this.furniture.splice(index, 1);
    }
  }

  /**
   * Save room customization
   */
  async save(): Promise<void> {
    if (!this.currentConfig) return;

    // Update room config
    this.currentConfig.room.lighting = {
      ...this.currentConfig.room.lighting,
      preset: this.lightingPreset,
    };

    this.currentConfig.room.environment = {
      ...this.currentConfig.room.environment,
      wallMaterial: {
        color: this.wallColor,
        texture: null,
      },
      floorMaterial: {
        color: this.floorColor,
        texture: null,
      },
      furniture: [...this.furniture],
    };

    // Update timestamp
    this.currentConfig.timestamp = Date.now();

    // Save to storage
    await this.resourceLoader.getStorage().save(this.currentConfig);

    // Clear cache so next load gets fresh data
    this.resourceLoader.clearCache(this.participantId);

    // Call onSave callback
    if (this.options.onSave) {
      this.options.onSave(this.currentConfig);
    }
  }
}
