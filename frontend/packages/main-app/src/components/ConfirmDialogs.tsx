/**
 * ConfirmDialogs Component
 * Confirmation dialogs for leave/end meeting actions
 */

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
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, PhoneOff } from 'lucide-react';

interface LeaveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveConfirmDialog({ open, onOpenChange }: LeaveConfirmDialogProps) {
  const navigate = useNavigate();
  const { leaveMeeting } = useMeetingStore();
  const { toast } = useToast();

  const handleLeave = () => {
    try {
      leaveMeeting();
      toast({
        title: 'Left meeting',
        description: 'You have left the meeting',
      });
      onOpenChange(false);
      navigate('/');
    } catch (error) {
      toast({
        title: 'Failed to leave',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Leave Meeting?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this meeting?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You can rejoin the meeting at any time using the meeting code.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLeave}>
            Leave Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EndMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EndMeetingDialog({ open, onOpenChange }: EndMeetingDialogProps) {
  const navigate = useNavigate();
  const { meeting, endMeeting } = useMeetingStore();
  const { toast } = useToast();

  const handleEndMeeting = () => {
    try {
      endMeeting();
      toast({
        title: 'Meeting ended',
        description: 'The meeting has been ended for all participants',
      });
      onOpenChange(false);
      navigate('/');

      // TODO: Send WebSocket event to notify all participants
      // wsController.emit('MEETING_ENDED', { meetingId: meeting.id });
    } catch (error) {
      toast({
        title: 'Failed to end meeting',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneOff className="h-5 w-5 text-destructive" />
            End Meeting for All?
          </DialogTitle>
          <DialogDescription>
            This will end the meeting for all participants. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-1">
              Warning
            </p>
            <p className="text-sm text-muted-foreground">
              All participants will be removed from the meeting and the meeting will be closed.
            </p>
          </div>

          {meeting && (
            <div className="text-sm">
              <p className="text-muted-foreground">
                Meeting: <span className="font-medium text-foreground">{meeting.title}</span>
              </p>
              <p className="text-muted-foreground">
                Code: <span className="font-mono font-medium text-foreground">{meeting.code}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleEndMeeting}>
            End Meeting for All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
