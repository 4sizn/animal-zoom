/**
 * EditorBase - Base class for scene editors
 * Provides common functionality for EditMyAnimal and EditMyRoom
 */

import * as BABYLON from "@babylonjs/core";
import type { ResourceLoader } from "../resources/ResourceLoader";

export interface EditorOptions {
  onSave?: (config: any) => void;
  onCancel?: () => void;
}

/**
 * Base class for full-screen editors (EditMyAnimal, EditMyRoom)
 */
export abstract class EditorBase {
  protected scene: BABYLON.Scene;
  protected engine: BABYLON.Engine | BABYLON.NullEngine;
  protected camera?: BABYLON.ArcRotateCamera;
  protected resourceLoader: ResourceLoader;
  protected participantId: string;
  protected options: EditorOptions;
  private isDisposed = false;

  constructor(
    canvas: HTMLCanvasElement,
    resourceLoader: ResourceLoader,
    participantId: string,
    engine?: BABYLON.Engine | BABYLON.NullEngine,
    options: EditorOptions = {}
  ) {
    this.resourceLoader = resourceLoader;
    this.participantId = participantId;
    this.options = options;

    // Use provided engine or create new one
    if (engine) {
      this.engine = engine;
    } else {
      this.engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });
    }

    // Create scene
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.25, 1);

    // Setup camera and lighting (abstract methods implemented by subclasses)
    this.setupCamera();
    this.setupLighting();

    // Start render loop
    this.startRenderLoop();
  }

  /**
   * Get the Babylon.js scene
   */
  getScene(): BABYLON.Scene {
    return this.scene;
  }

  /**
   * Setup camera for the editor
   */
  protected abstract setupCamera(): void;

  /**
   * Setup lighting for the editor
   */
  protected abstract setupLighting(): void;

  /**
   * Save changes
   */
  abstract save(): Promise<void>;

  /**
   * Cancel editing without saving
   */
  cancel(): void {
    if (this.options.onCancel) {
      this.options.onCancel();
    }
  }

  /**
   * Start the render loop
   */
  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      if (!this.isDisposed && this.scene) {
        this.scene.render();
      }
    });
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    if (this.scene && !this.scene.isDisposed) {
      this.scene.dispose();
    }

    // Don't dispose engine if it was provided externally (for testing)
    // Only dispose if we created it
    if (this.engine && !(this.engine instanceof BABYLON.NullEngine)) {
      this.engine.dispose();
    }
  }
}
