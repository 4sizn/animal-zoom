/**
 * HostPreview Page
 * Pre-room setup screen for host before starting the live session
 */

import { getInstance as getWebSocketController } from "@animal-zoom/shared/socket";
import { CheckCircle2, Copy, Loader2, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRoomStore } from "@/stores/roomStore";

export function HostPreview() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { room, currentUser, startRoom, isLoading } = useRoomStore();
  const [copied, setCopied] = useState(false);

  // Connect to WebSocket when entering preview (but don't sync yet)
  useEffect(() => {
    const wsController = getWebSocketController();

    // Connect to WebSocket if not already connected
    if (!wsController.isConnected()) {
      console.log("[HostPreview] Connecting to WebSocket...");
      wsController.connect();
    }

    // Join room when connected
    const connectedSub = wsController.connected$.subscribe(() => {
      if (room?.code) {
        console.log(
          "[HostPreview] WebSocket connected, joining room:",
          room.code,
        );
        wsController.joinRoom(room.code);
      }
    });

    return () => {
      connectedSub.unsubscribe();
      // Keep connection alive - don't disconnect
      // Synchronization will be enabled in LiveSession
    };
  }, [room?.code]);

  useEffect(() => {
    console.log("[HostPreview] Validation:", {
      hasRoom: !!room,
      roomId,
      storeRoomId: room?.id,
      match: room?.id === roomId,
      currentUser: currentUser?.name,
      isHost: currentUser?.isHost,
    });

    if (!room || room.id !== roomId) {
      console.log("[HostPreview] Validation FAILED - redirecting to home");
      navigate("/");
    } else {
      console.log("[HostPreview] Validation PASSED");
    }
  }, [room, roomId, currentUser, navigate]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const roomUrl = `${window.location.origin}/join/${room.code}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Room link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleStartRoom = () => {
    startRoom();
    toast({
      title: "Room started!",
      description: "Entering live session...",
    });
    navigate(`/room/${room.id}/session`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{room.title}</h1>
        <p className="text-muted-foreground">
          You're about to start a new room
        </p>
      </div>

      {/* Main Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Room Preview</CardTitle>
          <CardDescription>
            Review your room settings before starting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview Area - Placeholder for 3D viewer in future */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <Video className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                3D viewer will appear here
              </p>
            </div>
          </div>

          {/* Room Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Room Code:</span>
                <code className="px-2 py-1 bg-muted rounded text-primary font-mono">
                  {room.code}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className="font-medium">Waiting Room:</span>
                <span className="text-muted-foreground">
                  {room.waitingRoomEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Invite Link:</span>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={roomUrl}
                    className="flex-1 px-3 py-1 text-sm bg-muted rounded border-0 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              size="lg"
              onClick={handleStartRoom}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Start Room
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Room Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Waiting Room</p>
              <p className="text-sm text-muted-foreground">
                Participants wait for your approval
              </p>
            </div>
            <span
              className={
                room.waitingRoomEnabled
                  ? "text-green-600"
                  : "text-muted-foreground"
              }
            >
              {room.waitingRoomEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Room State</p>
              <p className="text-sm text-muted-foreground">
                Current status of your room
              </p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
              {room.state}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
