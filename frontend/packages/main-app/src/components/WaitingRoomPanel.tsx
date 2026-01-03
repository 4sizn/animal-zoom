/**
 * WaitingRoomPanel Component
 * Sidebar panel for host to manage waiting participants
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { ParticipantInfo } from '@/types/meeting';

interface WaitingRoomPanelProps {
  /**
   * If true, panel is collapsible and starts collapsed
   */
  collapsible?: boolean;
}

export function WaitingRoomPanel({ collapsible = false }: WaitingRoomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const { waitingParticipants, admitParticipant, rejectParticipant } = useMeetingStore();
  const { toast } = useToast();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleAdmit = async (participant: ParticipantInfo) => {
    setProcessingIds(prev => new Set(prev).add(participant.id));
    try {
      admitParticipant(participant.id);
      toast({
        title: 'Participant admitted',
        description: `${participant.name} has joined the meeting`,
      });
    } catch (error) {
      toast({
        title: 'Failed to admit participant',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(participant.id);
        return next;
      });
    }
  };

  const handleReject = async (participant: ParticipantInfo) => {
    setProcessingIds(prev => new Set(prev).add(participant.id));
    try {
      rejectParticipant(participant.id);
      toast({
        title: 'Participant rejected',
        description: `${participant.name} has been removed from the waiting room`,
      });
    } catch (error) {
      toast({
        title: 'Failed to reject participant',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(participant.id);
        return next;
      });
    }
  };

  const handleAdmitAll = async () => {
    for (const participant of waitingParticipants) {
      if (!processingIds.has(participant.id)) {
        await handleAdmit(participant);
      }
    }
  };

  if (waitingParticipants.length === 0) {
    return null; // Don't show panel if no one is waiting
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Waiting Room
              <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {waitingParticipants.length}
              </span>
            </CardTitle>
            <CardDescription>
              {waitingParticipants.length} {waitingParticipants.length === 1 ? 'person' : 'people'} waiting to join
            </CardDescription>
          </div>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {/* Admit All Button */}
          {waitingParticipants.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdmitAll}
              disabled={processingIds.size > 0}
              className="w-full"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Admit All ({waitingParticipants.length})
            </Button>
          )}

          {/* Participant List */}
          <div className="space-y-2">
            {waitingParticipants.map((participant) => {
              const isProcessing = processingIds.has(participant.id);
              const joinedAt = participant.joinedAt
                ? new Date(participant.joinedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Just now';

              return (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested at {joinedAt}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-3">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAdmit(participant)}
                      disabled={isProcessing}
                      title="Admit participant"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Admit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(participant)}
                      disabled={isProcessing}
                      title="Reject participant"
                    >
                      <UserX className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Reject</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
