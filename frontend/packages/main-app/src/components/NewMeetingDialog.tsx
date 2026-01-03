/**
 * NewMeetingDialog Component
 * Modal for creating a new meeting with settings
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMeetingDialog({ open, onOpenChange }: NewMeetingDialogProps) {
  const [title, setTitle] = useState('');
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createMeeting, isLoading } = useMeetingStore();

  const handleCreate = async () => {
    try {
      await createMeeting({
        title: title || 'Quick Meeting',
        waitingRoomEnabled,
      });

      toast({
        title: 'Meeting created!',
        description: 'Redirecting to host preview...',
      });

      onOpenChange(false);

      // Navigate to host preview
      const meetingId = useMeetingStore.getState().meeting?.id;
      if (meetingId) {
        navigate(`/meeting/${meetingId}/host-preview`);
      }
    } catch (error) {
      toast({
        title: 'Failed to create meeting',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setTitle('');
    setWaitingRoomEnabled(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription>
            Set up your meeting room. You can change these settings later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Meeting Title */}
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Meeting Title (Optional)
            </label>
            <Input
              id="title"
              placeholder="Quick Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Waiting Room Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="waiting-room" className="text-sm font-medium">
                Enable Waiting Room
              </label>
              <p className="text-xs text-muted-foreground">
                Participants will wait for your approval to join
              </p>
            </div>
            <button
              id="waiting-room"
              type="button"
              role="switch"
              aria-checked={waitingRoomEnabled}
              onClick={() => setWaitingRoomEnabled(!waitingRoomEnabled)}
              disabled={isLoading}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50
                ${waitingRoomEnabled ? 'bg-primary' : 'bg-input'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-background transition-transform
                  ${waitingRoomEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Meeting'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
