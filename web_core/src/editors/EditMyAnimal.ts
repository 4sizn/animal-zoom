/**
 * EditMyAnimal - Character editor scene
 * Full-screen editor for customizing participant's character
 */

import * as BABYLON from "@babylonjs/core";
import { EditorBase, type EditorOptions } from "./EditorBase";
import type { ResourceLoader } from "../resources/ResourceLoader";
import { SceneBuilder } from "../scene/SceneBuilder";
import type { ParticipantResourceConfig } from "../resources/ResourceConfig";

/**
 * Character editor for customizing animals
 */
export class EditMyAnimal extends EditorBase {
  private character?: BABYLON.AbstractMesh;
  private currentConfig?: ParticipantResourceConfig;
  private primaryColor: string = "#8080ff";
  private secondaryColor: string = "#ffffff";
  private equippedAccessories: string[] = [];
  private readonly availableAccessories = [
    "hat",
    "glasses",
    "scarf",
    "wings",
    "tail",
  ];

  constructor(
    canvas: HTMLCanvasElement,
    resourceLoader: ResourceLoader,
    participantId: string,
    engine?: BABYLON.Engine | BABYLON.NullEngine,
    options: EditorOptions = {}
  ) {
    super(canvas, resourceLoader, participantId, engine, options);

    // Create ground plane
    this.createGround();
  }

  /**
   * Setup camera for character viewing
   */
  protected setupCamera(): void {
    this.camera = new BABYLON.ArcRotateCamera(
      "editorCamera",
      Math.PI / 2, // Alpha: 90 degrees
      Math.PI / 3, // Beta: 60 degrees
      5, // Radius: 5 units for better view
      new BABYLON.Vector3(0, 1.2, 0), // Target: chest level
      this.scene
    );

    this.camera.fov = 0.8;
    this.camera.lowerRadiusLimit = 3;
    this.camera.upperRadiusLimit = 10;
    this.camera.lowerBetaLimit = Math.PI / 6;
    this.camera.upperBetaLimit = Math.PI / 2;

    // Enable user control for editing
    this.camera.attachControl(this.scene.getEngine().getRenderingCanvas()!, true);
  }

  /**
   * Setup lighting for character
   */
  protected setupLighting(): void {
    // Key light
    const keyLight = new BABYLON.DirectionalLight(
      "keyLight",
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    keyLight.position = new BABYLON.Vector3(3, 4, 3);
    keyLight.intensity = 1.0;
    keyLight.diffuse = new BABYLON.Color3(1, 0.98, 0.9);

    // Fill light
    const fillLight = new BABYLON.HemisphericLight(
      "fillLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    fillLight.intensity = 0.6;
    fillLight.diffuse = new BABYLON.Color3(0.96, 0.9, 0.85);
    fillLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.35);

    // Rim light
    const rimLight = new BABYLON.SpotLight(
      "rimLight",
      new BABYLON.Vector3(0, 3, -3),
      new BABYLON.Vector3(0, -1, 1),
      Math.PI / 3,
      2,
      this.scene
    );
    rimLight.intensity = 0.5;
    rimLight.diffuse = new BABYLON.Color3(0.9, 0.95, 1);
  }

  /**
   * Create ground plane
   */
  private createGround(): void {
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 20, height: 20 },
      this.scene
    );

    const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.45);
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = groundMat;
  }

  /**
   * Load character from config
   */
  async loadCharacter(): Promise<void> {
    try {
      // Load config
      this.currentConfig = await this.resourceLoader.loadParticipantConfig(
        this.participantId
      );

      // Build character using SceneBuilder
      const result = await SceneBuilder.buildCharacter(
        this.scene,
        this.currentConfig.character
      );

      this.character = result.mesh;

      // Position character
      if (!this.currentConfig.character.serializedData?.mesh?.position) {
        this.character.position.y = 1.2;
      }

      // Load customization settings
      if (this.currentConfig.character.customization?.colors?.primary) {
        this.primaryColor =
          this.currentConfig.character.customization.colors.primary;
      }
      if (this.currentConfig.character.customization?.colors?.secondary) {
        this.secondaryColor =
          this.currentConfig.character.customization.colors.secondary;
      }
      if (this.currentConfig.character.customization?.accessories) {
        this.equippedAccessories = [
          ...this.currentConfig.character.customization.accessories,
        ];
      }
    } catch (error) {
      console.error("Failed to load character:", error);

      // Fallback: create default sphere
      this.character = BABYLON.MeshBuilder.CreateSphere(
        "character",
        { diameter: 2, segments: 32 },
        this.scene
      );
      this.character.position.y = 1.2;

      const material = new BABYLON.StandardMaterial(
        "characterMat",
        this.scene
      );
      material.diffuseColor = this.hexToColor3(this.primaryColor);
      this.character.material = material;
    }
  }

  /**
   * Get character mesh
   */
  getCharacter(): BABYLON.AbstractMesh | undefined {
    return this.character;
  }

  /**
   * Get primary color
   */
  getPrimaryColor(): string {
    return this.primaryColor;
  }

  /**
   * Set primary color
   */
  setPrimaryColor(color: string): void {
    this.primaryColor = color;
    this.applyColors();
  }

  /**
   * Get secondary color
   */
  getSecondaryColor(): string {
    return this.secondaryColor;
  }

  /**
   * Set secondary color
   */
  setSecondaryColor(color: string): void {
    this.secondaryColor = color;
    this.applyColors();
  }

  /**
   * Apply color changes to character
   */
  private applyColors(): void {
    if (!this.character) return;

    // Create or update material
    let material = this.character.material as BABYLON.StandardMaterial;
    if (!material) {
      material = new BABYLON.StandardMaterial("characterMat", this.scene);
      this.character.material = material;
    }

    material.diffuseColor = this.hexToColor3(this.primaryColor);
    // Secondary color could be used for emissive or specular
    material.emissiveColor = this.hexToColor3(this.secondaryColor).scale(0.2);
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
   * Get available accessories
   */
  getAvailableAccessories(): string[] {
    return [...this.availableAccessories];
  }

  /**
   * Get equipped accessories
   */
  getEquippedAccessories(): string[] {
    return [...this.equippedAccessories];
  }

  /**
   * Add accessory to character
   */
  addAccessory(accessory: string): void {
    if (!this.equippedAccessories.includes(accessory)) {
      this.equippedAccessories.push(accessory);
    }
  }

  /**
   * Remove accessory from character
   */
  removeAccessory(accessory: string): void {
    const index = this.equippedAccessories.indexOf(accessory);
    if (index !== -1) {
      this.equippedAccessories.splice(index, 1);
    }
  }

  /**
   * Save character customization
   */
  async save(): Promise<void> {
    if (!this.currentConfig || !this.character) return;

    // Update customization in config
    this.currentConfig.character.customization = {
      ...this.currentConfig.character.customization,
      colors: {
        primary: this.primaryColor,
        secondary: this.secondaryColor,
      },
      accessories: [...this.equippedAccessories],
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
