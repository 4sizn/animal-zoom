/**
 * ParticipantListSidebar Component
 * Sidebar showing list of all participants
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/stores/roomStore';
import { ParticipantInfo, ParticipantStatus } from '@/types/room';
import { Circle, Moon, MinusCircle, Crown, X } from 'lucide-react';

interface ParticipantListSidebarProps {
  onClose?: () => void;
}

export function ParticipantListSidebar({ onClose }: ParticipantListSidebarProps) {
  const { participants, currentUser } = useRoomStore();

  const getStatusIcon = (status: ParticipantStatus) => {
    switch (status) {
      case 'PRESENT':
        return Circle;
      case 'AWAY':
        return Moon;
      case 'DO_NOT_DISTURB':
        return MinusCircle;
      default:
        return Circle;
    }
  };

  const getStatusColor = (status: ParticipantStatus): string => {
    switch (status) {
      case 'PRESENT':
        return 'text-green-500 fill-green-500';
      case 'AWAY':
        return 'text-yellow-500 fill-yellow-500';
      case 'DO_NOT_DISTURB':
        return 'text-red-500 fill-red-500';
      default:
        return 'text-gray-500 fill-gray-500';
    }
  };

  const getStatusLabel = (status: ParticipantStatus): string => {
    switch (status) {
      case 'PRESENT':
        return 'Present';
      case 'AWAY':
        return 'Away';
      case 'DO_NOT_DISTURB':
        return 'Do Not Disturb';
      default:
        return 'Unknown';
    }
  };

  // Sort participants: host first, then by name
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return a.name.localeCompare(b.name);
  });

  const ParticipantItem = ({ participant }: { participant: ParticipantInfo }) => {
    const StatusIcon = getStatusIcon(participant.status);
    const isCurrentUser = participant.id === currentUser?.id;

    return (
      <div
        className={`
          flex items-center gap-3 p-3 rounded-lg transition-colors
          ${isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}
        `}
      >
        {/* Avatar */}
        <div
          className={`
            h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm
            ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}
          `}
        >
          {participant.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {participant.name}
              {isCurrentUser && <span className="text-muted-foreground ml-1">(You)</span>}
            </p>
            {participant.isHost && (
              <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" title="Host" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusIcon className={`h-3 w-3 ${getStatusColor(participant.status)}`} />
            <span className="text-xs text-muted-foreground">
              {getStatusLabel(participant.status)}
            </span>
          </div>
        </div>

        {/* Host Actions - Placeholder for future features */}
        {currentUser?.isHost && !participant.isHost && (
          <div className="flex-shrink-0">
            {/* Future: Add dropdown menu with actions like "Make Host", "Remove", etc. */}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Participants</CardTitle>
            <CardDescription>
              {participants.length} {participants.length === 1 ? 'person' : 'people'} in room
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {sortedParticipants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No participants yet</p>
            </div>
          ) : (
            sortedParticipants.map((participant) => (
              <ParticipantItem key={participant.id} participant={participant} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
