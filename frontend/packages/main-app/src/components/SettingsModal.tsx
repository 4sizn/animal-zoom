/**
 * SettingsModal Component
 * User settings and status preferences
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/stores/roomStore';
import { useToast } from '@/hooks/use-toast';
import { ParticipantStatus } from '@/types/room';
import { Circle, Moon, MinusCircle } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { currentUser, updateParticipantStatus } = useRoomStore();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<ParticipantStatus>(
    currentUser?.status || 'PRESENT'
  );

  const handleSave = () => {
    if (!currentUser) return;

    try {
      updateParticipantStatus(currentUser.id, selectedStatus);
      toast({
        title: 'Status updated',
        description: `Your status has been changed to ${getStatusLabel(selectedStatus)}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
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

  const getStatusDescription = (status: ParticipantStatus): string => {
    switch (status) {
      case 'PRESENT':
        return 'You are active and available in the room';
      case 'AWAY':
        return 'You are temporarily away from the room';
      case 'DO_NOT_DISTURB':
        return 'You prefer not to be disturbed during the session';
      default:
        return '';
    }
  };

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
        return 'text-green-500';
      case 'AWAY':
        return 'text-yellow-500';
      case 'DO_NOT_DISTURB':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const statuses: ParticipantStatus[] = ['PRESENT', 'AWAY', 'DO_NOT_DISTURB'];

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your room preferences and status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Profile</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.isHost ? 'Host' : 'Participant'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Status</h3>
            <div className="space-y-2">
              {statuses.map((status) => {
                const Icon = getStatusIcon(status);
                const isSelected = selectedStatus === status;

                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${getStatusColor(status)}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{getStatusLabel(status)}</p>
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getStatusDescription(status)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
