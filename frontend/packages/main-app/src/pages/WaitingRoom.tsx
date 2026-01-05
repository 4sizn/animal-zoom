/**
 * WaitingRoom Page
 * Screen shown to participants waiting for host admission
 */

import { Clock, Loader2, Users } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRoomStore } from "@/stores/roomStore";

export function WaitingRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { room, currentUser } = useRoomStore();

  useEffect(() => {
    // Redirect if no room or wrong room
    if (!room || room.id !== roomId) {
      toast({
        title: "Room not found",
        description: "Redirecting to join page...",
        variant: "destructive",
      });
      navigate("/join");
      return;
    }

    // Redirect if not in waiting state
    if (currentUser?.joinState !== "WAITING") {
      toast({
        title: "Not in waiting room",
        description: "Redirecting...",
      });
      navigate("/join");
    }
  }, [room, roomId, currentUser, navigate, toast]);

  // Listen for admission via WebSocket
  useEffect(() => {
    if (!currentUser) return;

    // TODO: Subscribe to WebSocket events
    // When USER_ADMITTED event received, navigate to session
    // For now, this is a placeholder
    const checkAdmission = () => {
      if (currentUser.joinState === "JOINED") {
        toast({
          title: "You have been admitted!",
          description: "Joining the room...",
        });
        navigate(`/room/${roomId}/session`);
      }
    };

    // Poll for state changes (temporary until WebSocket integration)
    const interval = setInterval(checkAdmission, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUser, roomId, navigate, toast]);

  if (!room || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Waiting for Host</h1>
        <p className="text-muted-foreground">The host will admit you shortly</p>
      </div>

      {/* Waiting Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            Please Wait
          </CardTitle>
          <CardDescription>
            You're in the waiting room for this room
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Animated Waiting Indicator */}
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <Clock className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          </div>

          {/* Room Info */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Room</p>
                <p className="text-sm text-muted-foreground">{room.title}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Host</p>
                <p className="text-sm text-muted-foreground">{room.hostName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Your Name</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.name}
                </p>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              The host has been notified of your request to join. You'll be
              automatically admitted to the room once the host approves.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            This room has a waiting room enabled for security.
            <br />
            Thank you for your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
