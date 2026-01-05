/**
 * NewRoomDialog Component
 * Modal for creating a new room with settings
 */

import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRoomStore } from "@/stores/roomStore";

interface NewRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRoomDialog({ open, onOpenChange }: NewRoomDialogProps) {
  const [title, setTitle] = useState("");
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createRoom, isLoading } = useRoomStore();

  const handleCreate = async () => {
    try {
      await createRoom({
        title: title || "Quick Room",
        waitingRoomEnabled,
      });

      toast({
        title: "Room created!",
        description: "Redirecting to host preview...",
      });

      onOpenChange(false);

      // Navigate to host preview
      const roomId = useRoomStore.getState().room?.id;
      if (roomId) {
        navigate(`/room/${roomId}/host-preview`);
      }
    } catch (error) {
      toast({
        title: "Failed to create room",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTitle("");
    setWaitingRoomEnabled(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Set up your room. You can change these settings later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Room Title */}
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Room Title (Optional)
            </label>
            <Input
              id="title"
              placeholder="Quick Room"
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
                ${waitingRoomEnabled ? "bg-primary" : "bg-input"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-background transition-transform
                  ${waitingRoomEnabled ? "translate-x-6" : "translate-x-1"}
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
              "Create Room"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
