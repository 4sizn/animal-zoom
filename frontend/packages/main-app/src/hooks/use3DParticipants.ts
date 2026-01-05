/**
 * use3DParticipants Hook
 * Manages synchronization between room store participants and 3D scene avatars
 */

import type { Mesh, Scene } from "@babylonjs/core";
import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import type { ParticipantInfo } from "@/types/room";

/**
 * Hook to synchronize participants with 3D scene
 *
 * This hook will be enhanced once @animal-zoom/3d-viewer integration is complete.
 * It manages the lifecycle of 3D avatars based on participant state changes.
 *
 * @param participants - Current list of participants from room store
 * @param scene - Babylon.js scene instance (from SceneBuilder)
 * @param currentUserId - Current user's ID (to highlight their avatar)
 */
export function use3DParticipants(
  participants: ParticipantInfo[],
  scene: Scene | null,
  currentUserId: string,
) {
  // Track which participants have been added to the scene
  const participantAvatarsRef = useRef<Map<string, Mesh>>(new Map());

  useEffect(() => {
    if (!scene) return;

    const currentAvatars = participantAvatarsRef.current;
    const currentParticipantIds = new Set(participants.map((p) => p.id));
    const existingAvatarIds = new Set(currentAvatars.keys());

    // 1. Add new participants (create 3D avatars)
    for (const participant of participants) {
      if (!existingAvatarIds.has(participant.id)) {
        console.log("[3D] Adding avatar for:", participant.name);

        // Create sphere avatar
        const avatar = MeshBuilder.CreateSphere(
          `avatar-${participant.id}`,
          { diameter: 1, segments: 32 },
          scene,
        );

        // Create material
        const material = new StandardMaterial(
          `material-${participant.id}`,
          scene,
        );

        // Set color based on status
        switch (participant.status) {
          case "PRESENT":
            material.diffuseColor = new Color3(0.2, 0.8, 0.2); // Green
            break;
          case "AWAY":
            material.diffuseColor = new Color3(0.8, 0.8, 0.2); // Yellow
            break;
          case "DO_NOT_DISTURB":
            material.diffuseColor = new Color3(0.8, 0.2, 0.2); // Red
            break;
          default:
            material.diffuseColor = new Color3(0.5, 0.5, 0.8); // Default blue
        }

        avatar.material = material;

        // Position avatar in 3D space (circular arrangement)
        const angle =
          (currentAvatars.size * 2 * Math.PI) /
          Math.max(participants.length, 1);
        const radius = 3; // Distance from center
        avatar.position.x = Math.cos(angle) * radius;
        avatar.position.y = 0.5; // Slightly above ground
        avatar.position.z = Math.sin(angle) * radius;

        // Highlight current user's avatar
        if (participant.id === currentUserId) {
          avatar.scaling = new Vector3(1.3, 1.3, 1.3); // Slightly larger
        }

        currentAvatars.set(participant.id, avatar);
      }
    }

    // 2. Remove participants who left (dispose 3D avatars)
    for (const avatarId of existingAvatarIds) {
      if (!currentParticipantIds.has(avatarId)) {
        console.log("[3D] Removing avatar for:", avatarId);

        const avatar = currentAvatars.get(avatarId);
        if (avatar) {
          avatar.dispose();
        }

        currentAvatars.delete(avatarId);
      }
    }

    // 3. Update existing avatars (position rearrangement when count changes)
    if (currentAvatars.size > 0) {
      let index = 0;
      for (const [id, avatar] of currentAvatars.entries()) {
        const angle = (index * 2 * Math.PI) / currentAvatars.size;
        const radius = 3;
        avatar.position.x = Math.cos(angle) * radius;
        avatar.position.z = Math.sin(angle) * radius;
        index++;
      }
    }

    // Cleanup function
    return () => {
      // Note: Don't dispose avatars on every re-render, only on unmount
      // Disposal is handled in the removal logic above
    };
  }, [participants, scene, currentUserId]);

  // Cleanup all avatars on unmount
  useEffect(() => {
    return () => {
      const currentAvatars = participantAvatarsRef.current;
      console.log("[3D] Cleaning up all avatars");

      // TODO: Dispose all avatars
      // for (const [id, avatar] of currentAvatars.entries()) {
      //   avatar.dispose();
      // }

      currentAvatars.clear();
    };
  }, []);

  // Return avatar count for debugging
  return {
    avatarCount: participantAvatarsRef.current.size,
    avatars: participantAvatarsRef.current,
  };
}
