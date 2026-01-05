/**
 * ConfirmDialogs Component
 * Confirmation dialogs for leave/end room actions
 */

import { AlertCircle, PhoneOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRoomStore } from "@/stores/roomStore";

interface LeaveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveConfirmDialog({
  open,
  onOpenChange,
}: LeaveConfirmDialogProps) {
  const navigate = useNavigate();
  const { leaveRoom } = useRoomStore();
  const { toast } = useToast();

  const handleLeave = () => {
    try {
      leaveRoom();
      toast({
        title: "Left room",
        description: "You have left the room",
      });
      onOpenChange(false);
      navigate("/");
    } catch (error) {
      toast({
        title: "Failed to leave",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Leave Room?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this room?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You can rejoin the room at any time using the room code.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLeave}>
            Leave Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EndRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EndRoomDialog({ open, onOpenChange }: EndRoomDialogProps) {
  const navigate = useNavigate();
  const { room, endRoom } = useRoomStore();
  const { toast } = useToast();

  const handleEndRoom = () => {
    try {
      endRoom();
      toast({
        title: "Room ended",
        description: "The room has been ended for all participants",
      });
      onOpenChange(false);
      navigate("/");

      // TODO: Send WebSocket event to notify all participants
      // wsController.emit('ROOM_ENDED', { roomId: room.id });
    } catch (error) {
      toast({
        title: "Failed to end room",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneOff className="h-5 w-5 text-destructive" />
            End Room for All?
          </DialogTitle>
          <DialogDescription>
            This will end the room for all participants. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-1">Warning</p>
            <p className="text-sm text-muted-foreground">
              All participants will be removed from the room and the room will
              be closed.
            </p>
          </div>

          {room && (
            <div className="text-sm">
              <p className="text-muted-foreground">
                Room:{" "}
                <span className="font-medium text-foreground">
                  {room.title}
                </span>
              </p>
              <p className="text-muted-foreground">
                Code:{" "}
                <span className="font-mono font-medium text-foreground">
                  {room.code}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleEndRoom}>
            End Room for All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
