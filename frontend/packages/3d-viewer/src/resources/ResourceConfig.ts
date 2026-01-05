/**
 * Resource configuration types and validation for participant resources
 *
 * This module defines the data contract for participant resources (character and room),
 * including type definitions and validation functions.
 */

/**
 * Complete resource configuration for a participant, including both character and room data.
 */
export interface ParticipantResourceConfig {
  version: string;
  participantId: string;
  timestamp: number;

  character: CharacterConfig;
  room: RoomConfig;
}

/**
 * Character configuration including model URL, serialized data, and customization options.
 */
export interface CharacterConfig {
  modelUrl: string;
  serializedData: any; // Babylon.js serialized mesh data
  customization: {
    colors?: Record<string, string>;
    accessories?: string[];
    animations?: string[];
  };
}

/**
 * Room configuration including serialized scene data, environment setup, and lighting.
 */
export interface RoomConfig {
  serializedData: any; // Babylon.js serialized scene data
  environment: {
    furniture?: any[];
    decorations?: any[];
    wallMaterial?: any;
    floorMaterial?: any;
  };
  lighting: {
    preset: string;
    customLights?: any[];
  };
}

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of validation error messages */
  errors: string[];
}

/**
 * Validates a complete participant resource configuration.
 *
 * @param config - The configuration object to validate
 * @returns Validation result with any error messages
 *
 * @example
 * ```typescript
 * const result = validateParticipantResourceConfig(config);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateParticipantResourceConfig(
  config: any,
): ValidationResult {
  const errors: string[] = [];

  if (!config.version) {
    errors.push("version is required");
  } else if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
    errors.push("version must be in semver format (e.g., 1.0.0)");
  }

  if (!config.participantId) {
    errors.push("participantId is required");
  }

  if (config.timestamp === undefined || config.timestamp === null) {
    errors.push("timestamp is required");
  } else if (typeof config.timestamp !== "number" || config.timestamp < 0) {
    errors.push("timestamp must be a positive number");
  }

  if (!config.character) {
    errors.push("character is required");
  } else {
    const characterResult = validateCharacterConfig(config.character);
    errors.push(...characterResult.errors);
  }

  if (!config.room) {
    errors.push("room is required");
  } else {
    const roomResult = validateRoomConfig(config.room);
    errors.push(...roomResult.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a character configuration.
 *
 * @param config - The character config to validate
 * @returns Validation result with any error messages
 */
export function validateCharacterConfig(config: any): ValidationResult {
  const errors: string[] = [];

  if (!config.modelUrl) {
    errors.push("modelUrl is required");
  } else if (!/^https?:\/\/.+/.test(config.modelUrl)) {
    errors.push("modelUrl must be a valid HTTP/HTTPS URL");
  }

  if (!config.serializedData) {
    errors.push("serializedData is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a room configuration.
 *
 * @param config - The room config to validate
 * @returns Validation result with any error messages
 */
export function validateRoomConfig(config: any): ValidationResult {
  const errors: string[] = [];

  if (!config.serializedData) {
    errors.push("serializedData is required");
  }

  if (!config.environment) {
    errors.push("environment is required");
  }

  if (!config.lighting) {
    errors.push("lighting is required");
  } else if (!config.lighting.preset || config.lighting.preset === "") {
    errors.push("lighting preset must be a non-empty string");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
