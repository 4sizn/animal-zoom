/**
 * JoinMeeting Page
 * Entry point for participants to join a room
 */

import { Loader2, LogIn } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRoomStore } from "@/stores/roomStore";
import { authApi } from "@animal-zoom/shared";

export function JoinMeeting() {
  const { roomCode: urlRoomCode } = useParams<{ roomCode?: string }>();
  const [roomId, setRoomId] = useState(urlRoomCode || "");
  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const navigate = useNavigate();
  const { room, currentUser, joinRoom, isLoading, error } = useRoomStore();
  const { toast } = useToast();

  // Navigate after joining - redirect based on host status
  useEffect(() => {
    console.log("Navigation useEffect:", {
      isJoining,
      room: !!room,
      roomId: room?.id,
      currentUser: !!currentUser,
      isHost: currentUser?.isHost,
    });

    if (isJoining && room && room.id && currentUser) {
      console.log("Navigating...", {
        isHost: currentUser.isHost,
        roomId: room.id,
      });

      toast({
        title: "Joining room...",
        description: currentUser.isHost
          ? "Redirecting to host preview"
          : "Redirecting to participant preview",
      });

      // Navigate to appropriate preview page based on role
      if (currentUser.isHost) {
        console.log("Navigating to host-preview");
        navigate(`/room/${room.id}/host-preview`);
      } else {
        console.log("Navigating to participant-preview");
        navigate(`/room/${room.id}/participant-preview`);
      }

      setIsJoining(false);
    } else {
      console.log("Navigation condition failed:", {
        hasIsJoining: !!isJoining,
        hasRoom: !!room,
        hasRoomId: !!room?.id,
        hasCurrentUser: !!currentUser,
      });
    }
  }, [isJoining, room, currentUser, navigate, toast]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle join room
  const handleJoinRoom = async () => {
    if (!nickname.trim()) {
      toast({
        title: "Nickname required",
        description: "Please enter your nickname",
        variant: "destructive",
      });
      return;
    }

    if (!roomId.trim()) {
      toast({
        title: "Room ID required",
        description: "Please enter a room ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsJoining(true);

      // First, authenticate as guest to get token
      if (!authApi.isAuthenticated()) {
        await authApi.createGuest({ displayName: nickname.trim() });
      }

      // Then join the room with the token
      await joinRoom(roomId.trim(), { userName: nickname.trim() });
      // Navigation happens in useEffect after room is updated
    } catch (err) {
      setIsJoining(false);
      toast({
        title: "Failed to join room",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Join a Meeting</h1>
        <p className="text-muted-foreground">
          Enter your nickname and room code to join
        </p>
      </div>

      {/* Nickname Input */}
      <Card>
        <CardHeader>
          <CardTitle>Your Nickname</CardTitle>
          <CardDescription>Enter your nickname to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            id="nickname"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={50}
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Join Room Card */}
      <Card>
        <CardHeader>
          <CardTitle>Join Room</CardTitle>
          <CardDescription>Enter a room code to join</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="room-code" className="text-sm font-medium">
              Room Code
            </label>
            <Input
              id="room-code"
              placeholder="Enter room code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              maxLength={20}
              className="font-mono"
            />
          </div>
          <Button
            onClick={handleJoinRoom}
            disabled={!nickname.trim() || !roomId.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Join Room
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Helper Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Don't have a room code?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:underline font-medium"
            >
              Create a new room
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
