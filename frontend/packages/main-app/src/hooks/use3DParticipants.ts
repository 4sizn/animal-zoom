/**
 * use3DParticipants Hook
 * Manages synchronization between room store participants and 3D scene avatars
 */

import { useEffect, useRef } from 'react';
import { ParticipantInfo } from '@/types/room';

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
  scene: any, // TODO: Type as Babylon.Scene once integrated
  currentUserId: string
) {
  // Track which participants have been added to the scene
  const participantAvatarsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!scene) return;

    // TODO: Integrate with ParticipantManager from @animal-zoom/3d-viewer
    //
    // Expected integration:
    // import { ParticipantManager } from '@animal-zoom/3d-viewer';
    //
    // const participantManager = new ParticipantManager(scene);

    const currentAvatars = participantAvatarsRef.current;
    const currentParticipantIds = new Set(participants.map(p => p.id));
    const existingAvatarIds = new Set(currentAvatars.keys());

    // 1. Add new participants (create 3D avatars)
    for (const participant of participants) {
      if (!existingAvatarIds.has(participant.id)) {
        console.log('[3D] Adding avatar for:', participant.name);

        // TODO: Create 3D avatar using ParticipantManager
        // const avatar = participantManager.createAvatar({
        //   id: participant.id,
        //   name: participant.name,
        //   isCurrentUser: participant.id === currentUserId,
        //   status: participant.status
        // });
        //
        // // Position avatar in 3D space (circular arrangement)
        // const angle = (currentAvatars.size * 2 * Math.PI) / (participants.length + 1);
        // const radius = 5; // Distance from center
        // avatar.position.x = Math.cos(angle) * radius;
        // avatar.position.z = Math.sin(angle) * radius;
        //
        // currentAvatars.set(participant.id, avatar);

        // Placeholder: Store participant in map
        currentAvatars.set(participant.id, { participantId: participant.id });
      }
    }

    // 2. Remove participants who left (dispose 3D avatars)
    for (const avatarId of existingAvatarIds) {
      if (!currentParticipantIds.has(avatarId)) {
        console.log('[3D] Removing avatar for:', avatarId);

        const avatar = currentAvatars.get(avatarId);
        if (avatar) {
          // TODO: Dispose avatar mesh
          // avatar.dispose();
        }

        currentAvatars.delete(avatarId);
      }
    }

    // 3. Update existing avatars (status changes, highlighting, etc.)
    for (const participant of participants) {
      const avatar = currentAvatars.get(participant.id);
      if (avatar) {
        // TODO: Update avatar visual based on status
        // switch (participant.status) {
        //   case 'PRESENT':
        //     avatar.material.diffuseColor = new Color3(0.2, 0.8, 0.2); // Green
        //     break;
        //   case 'AWAY':
        //     avatar.material.diffuseColor = new Color3(0.8, 0.8, 0.2); // Yellow
        //     break;
        //   case 'DO_NOT_DISTURB':
        //     avatar.material.diffuseColor = new Color3(0.8, 0.2, 0.2); // Red
        //     break;
        // }
        //
        // // Highlight current user's avatar
        // if (participant.id === currentUserId) {
        //   avatar.scaling = new Vector3(1.2, 1.2, 1.2); // Slightly larger
        //   avatar.addGlow(); // Add glow effect
        // }
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
      console.log('[3D] Cleaning up all avatars');

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
    avatars: participantAvatarsRef.current
  };
}
