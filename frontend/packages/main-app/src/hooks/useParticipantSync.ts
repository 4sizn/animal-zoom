/**
 * useParticipantSync Hook
 * Manages WebSocket synchronization for participant events in live session
 */

import { useEffect } from 'react';
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { ParticipantStatus } from '@/types/meeting';
import { getInstance } from '@animal-zoom/shared/socket';

/**
 * Hook to synchronize participant state via WebSocket
 *
 * This hook will be enhanced once WebSocket controller from @animal-zoom/shared
 * is properly integrated. For now, it provides the structure for future integration.
 *
 * @param meetingId - The current meeting ID
 * @param enabled - Whether to enable synchronization
 */
export function useParticipantSync(meetingId: string | undefined, enabled = true) {
  const { toast } = useToast();
  const {
    addParticipant,
    removeParticipant,
    updateParticipantStatus,
    updateMeetingState
  } = useMeetingStore();

  useEffect(() => {
    if (!meetingId || !enabled) return;

    // Get WebSocket controller instance
    const wsController = getInstance();
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    console.log('[useParticipantSync] Starting synchronization for meeting:', meetingId);

    // Subscribe to room joined events (includes initial participant list)
    const roomJoinedSub = wsController.roomJoined$.subscribe((data) => {
      console.log('[useParticipantSync] Room joined with participants:', data);

      // Set all participants from the room
      const participants = data.participants.map((p) => ({
        id: p.id,
        name: p.displayName,
        joinState: 'JOINED' as const,
        status: 'PRESENT' as const,
        isHost: false, // TODO: Determine from participant data
        joinedAt: new Date(),
      }));

      // Use setParticipants to replace the entire list
      const { setParticipants } = useMeetingStore.getState();
      setParticipants(participants);

      console.log('[useParticipantSync] Updated participant list:', participants);
    });
    subscriptions.push(roomJoinedSub);

    // Subscribe to user joined events
    const userJoinedSub = wsController.userJoined$.subscribe((data) => {
      console.log('[useParticipantSync] User joined:', data);

      addParticipant({
        id: data.participant.id,
        name: data.participant.displayName,
        joinState: 'JOINED',
        status: 'PRESENT',
        isHost: false,
        joinedAt: new Date(),
      });

      toast({
        title: 'Participant joined',
        description: `${data.participant.displayName} joined the meeting`,
      });
    });
    subscriptions.push(userJoinedSub);

    // Subscribe to user left events
    const userLeftSub = wsController.userLeft$.subscribe((data) => {
      console.log('[useParticipantSync] User left:', data);

      removeParticipant(data.participant.id);

      toast({
        title: 'Participant left',
        description: `${data.participant.displayName} left the meeting`,
      });
    });
    subscriptions.push(userLeftSub);

    // Subscribe to room updated events (meeting state changes)
    const roomUpdatedSub = wsController.roomUpdated$.subscribe((data) => {
      console.log('[useParticipantSync] Room updated:', data);

      toast({
        title: 'Meeting updated',
        description: 'Meeting settings have been changed',
      });
    });
    subscriptions.push(roomUpdatedSub);

    // Subscribe to connection errors
    const errorSub = wsController.error$.subscribe((error) => {
      console.error('[useParticipantSync] WebSocket error:', error);

      toast({
        title: 'Connection error',
        description: 'Lost connection to the meeting. Attempting to reconnect...',
        variant: 'destructive',
      });
    });
    subscriptions.push(errorSub);

    // Subscribe to disconnection events
    const disconnectedSub = wsController.disconnected$.subscribe((reason) => {
      console.log('[useParticipantSync] Disconnected:', reason);

      if (reason === 'io server disconnect') {
        toast({
          title: 'Meeting ended',
          description: 'The meeting has been ended by the host',
        });
        updateMeetingState('ENDED');
      }
    });
    subscriptions.push(disconnectedSub);

    return () => {
      console.log('[useParticipantSync] Cleaning up subscriptions');
      // Unsubscribe from all events
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [
    meetingId,
    enabled,
    addParticipant,
    removeParticipant,
    updateParticipantStatus,
    updateMeetingState,
    toast
  ]);
}
