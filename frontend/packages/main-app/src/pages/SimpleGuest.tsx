/**
 * SimpleGuest Page
 * Simplified interface for creating or joining meetings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { authApi } from '@animal-zoom/shared/api';

export function SimpleGuest() {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const navigate = useNavigate();
  const { meeting, createMeeting, joinMeeting, isLoading, error } = useMeetingStore();
  const { toast } = useToast();

  // Auto-populate room ID when meeting is created
  useEffect(() => {
    if (meeting && meeting.code) {
      setRoomId(meeting.code);
    }
  }, [meeting]);

  // Navigate to live session after joining
  useEffect(() => {
    if (isJoining && meeting && meeting.id) {
      toast({
        title: 'Joining meeting...',
        description: 'Entering session',
      });
      navigate(`/meeting/${meeting.id}/session`);
      setIsJoining(false);
    }
  }, [isJoining, meeting, navigate, toast]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Handle create room
  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Nickname required',
        description: 'Please enter your nickname',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, authenticate as guest to get token
      if (!authApi.isAuthenticated()) {
        await authApi.createGuest({ displayName: nickname.trim() });
      }

      // Then create the room with the token
      await createMeeting({ title: 'Quick Meeting' });
      toast({
        title: 'Room created!',
        description: 'Your room ID has been generated',
      });
    } catch (err) {
      toast({
        title: 'Failed to create room',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // Handle join room
  const handleJoinRoom = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Nickname required',
        description: 'Please enter your nickname',
        variant: 'destructive',
      });
      return;
    }

    if (!roomId.trim()) {
      toast({
        title: 'Room ID required',
        description: 'Please enter a room ID',
        variant: 'destructive',
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
      await joinMeeting(roomId.trim(), { userName: nickname.trim() });
      // Navigation happens in useEffect after meeting is updated
    } catch (err) {
      setIsJoining(false);
      toast({
        title: 'Failed to join room',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simple Guest</h1>
        <p className="text-muted-foreground">
          Create a new room or join an existing one
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
          <CardDescription>
            Provide your nickname to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nickname Input */}
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium">
              Your Nickname
            </label>
            <Input
              id="nickname"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Room ID Input */}
          <div className="space-y-2">
            <label htmlFor="room-id" className="text-sm font-medium">
              Room ID
            </label>
            <Input
              id="room-id"
              placeholder="Enter room ID or create new"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            {/* Create Room Button */}
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
                'Create Room'
              )}
            </Button>

            {/* Join Room Button */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
