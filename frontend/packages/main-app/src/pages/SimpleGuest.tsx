/**
 * SimpleGuest Page
 * Simplified interface for creating or joining rooms
 */

import { authApi } from "@animal-zoom/shared/api";
import { Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export function SimpleGuest() {
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();
  const { room, currentUser, createRoom, joinRoom, isLoading, error } =
    useRoomStore();
  const { toast } = useToast();

  // Removed auto-populate - room code will be shown in host-preview page

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

  // Handle create room
  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      toast({
        title: "Nickname required",
        description: "Please enter your nickname",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return; // Prevent double-click

    console.log("[SimpleGuest] handleCreateRoom - START");

    try {
      // First, authenticate as guest to get token
      if (!authApi.isAuthenticated()) {
        console.log("[SimpleGuest] Authenticating as guest...");
        await authApi.createGuest({ displayName: nickname.trim() });
      }

      // Then create the room with the token
      console.log("[SimpleGuest] Creating room...");
      await createRoom({ title: "Quick Room" });

      // Get the fresh state after creation
      const { room: newRoom, currentUser: newUser } = useRoomStore.getState();
      console.log("[SimpleGuest] Room created, navigating to:", newRoom?.id);

      if (newRoom?.id && newUser?.isHost) {
        navigate(`/room/${newRoom.id}/host-preview`);
      }
    } catch (err) {
      console.error("[SimpleGuest] Failed to create room:", err);
      toast({
        title: "Failed to create room",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

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

    if (isLoading) return; // Prevent double-click

    try {
      // First, authenticate as guest to get token
      if (!authApi.isAuthenticated()) {
        await authApi.createGuest({ displayName: nickname.trim() });
      }

      // Then join the room with the token
      await joinRoom(roomId.trim(), { userName: nickname.trim() });

      // Get the fresh state after joining
      const { room: joinedRoom, currentUser: joinedUser } =
        useRoomStore.getState();
      console.log("[SimpleGuest] Joined room, navigating to:", joinedRoom?.id);

      if (joinedRoom?.id && joinedUser) {
        const path = joinedUser.isHost
          ? `/room/${joinedRoom.id}/host-preview`
          : `/room/${joinedRoom.id}/participant-preview`;
        navigate(path);
      }
    } catch (err) {
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
        <h1 className="text-3xl font-bold">Simple Guest</h1>
        <p className="text-muted-foreground">
          Create a new room or join an existing one
        </p>
      </div>

      {/* Nickname Input - Common for both actions */}
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

      {/* Two Action Cards Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create Room</CardTitle>
            <CardDescription>Start a new room</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleCreateRoom}
              disabled={!nickname.trim() || isLoading}
              className="w-full"
              variant="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Room...
                </>
              ) : (
                "Create Room"
              )}
            </Button>
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
              variant="outline"
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
      </div>
    </div>
  );
}
