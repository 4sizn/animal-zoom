/**
 * useWaitingRoomSync Hook
 * Manages WebSocket synchronization for waiting room events
 */

import { getInstance as getWebSocketController } from "@animal-zoom/shared/socket";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRoomStore } from "@/stores/roomStore";
import { Button } from "@/components/ui/button";

/**
 * Hook to synchronize waiting room state via WebSocket
 *
 * @param roomId - The current room ID
 */
export function useWaitingRoomSync(roomId: string | undefined) {
  const { toast, dismiss } = useToast();
  const { addToWaitingRoom, addParticipant, removeParticipant, admitParticipant, rejectParticipant, room } =
    useRoomStore();

  useEffect(() => {
    if (!roomId) return;

    const wsController = getWebSocketController();

    // Subscribe to user:waiting events (new user in waiting room)
    const userWaitingSub = wsController.userWaiting$.subscribe((data) => {
      console.log("[useWaitingRoomSync] User waiting:", data);

      if (data.user) {
        const participantUserId = data.user.userId;
        const participantName = data.user.displayName || 'Guest';

        // Add to waiting room list
        addToWaitingRoom({
          id: participantUserId,
          name: participantName,
          joinState: 'WAITING',
          status: 'PRESENT',
          isHost: false,
          joinedAt: new Date().toISOString(),
        });

        // Show toast notification with action buttons
        const toastInstance = toast({
          title: '🚪 New participant waiting',
          description: (
            <div className="flex flex-col gap-3 mt-2">
              <p className="text-sm">{participantName} wants to join the room</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (room?.code) {
                      wsController.admitUser(room.code, participantUserId);
                      admitParticipant(participantUserId);
                      dismiss(toastInstance.id);
                      toast({
                        title: '✅ Participant admitted',
                        description: `${participantName} is joining the room`,
                      });
                    }
                  }}
                  className="flex-1"
                >
                  Admit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (room?.code) {
                      wsController.rejectUser(room.code, participantUserId);
                      rejectParticipant(participantUserId);
                      dismiss(toastInstance.id);
                      toast({
                        title: '❌ Participant rejected',
                        description: `${participantName} was denied entry`,
                      });
                    }
                  }}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          ),
          duration: Infinity, // Don't auto-dismiss
        });
      }
    });

    // Subscribe to user:joined events (participant admitted)
    const userJoinedSub = wsController.userJoined$.subscribe((data) => {
      console.log("[useWaitingRoomSync] User joined:", data);

      // Add to participants list
      if (data.user && data.participants) {
        // Update the full participants list from the server
        data.participants.forEach((participant: any) => {
          addParticipant({
            id: participant.userId,
            name: participant.displayName || participant.username || 'Guest',
            joinState: 'JOINED',
            status: 'PRESENT',
            isHost: participant.isHost || false,
            joinedAt: participant.joinedAt || new Date().toISOString(),
          });
        });

        toast({
          title: 'Participant admitted',
          description: 'User has joined the room',
        });
      }
    });

    // Subscribe to user:left events
    const userLeftSub = wsController.userLeft$.subscribe((data) => {
      console.log("[useWaitingRoomSync] User left:", data);

      if (data.userId) {
        removeParticipant(data.userId);

        toast({
          title: 'Participant left',
          description: 'A user has left the room',
        });
      }
    });

    return () => {
      userWaitingSub.unsubscribe();
      userJoinedSub.unsubscribe();
      userLeftSub.unsubscribe();
    };
  }, [roomId, addToWaitingRoom, addParticipant, removeParticipant, toast]);
}
