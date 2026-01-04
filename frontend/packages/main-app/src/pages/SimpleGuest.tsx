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
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const { meeting, currentUser, createMeeting, joinMeeting, isLoading, error } = useMeetingStore();
  const { toast } = useToast();

  // Auto-populate room ID when meeting is created
  useEffect(() => {
    if (meeting && meeting.code) {
      setRoomId(meeting.code);
    }
  }, [meeting]);

  // Navigate to host preview after creating room
  useEffect(() => {
    if (isCreating && meeting && meeting.id && currentUser?.isHost) {
      toast({
        title: 'Room created!',
        description: 'Redirecting to host preview',
      });
      navigate(`/meeting/${meeting.id}/host-preview`);
      setIsCreating(false);
    }
  }, [isCreating, meeting, currentUser, navigate, toast]);

  // Navigate after joining - redirect based on host status
  useEffect(() => {
    console.log('Navigation useEffect:', {
      isJoining,
      meeting: !!meeting,
      meetingId: meeting?.id,
      currentUser: !!currentUser,
      isHost: currentUser?.isHost
    });

    if (isJoining && meeting && meeting.id && currentUser) {
      console.log('Navigating...', { isHost: currentUser.isHost, meetingId: meeting.id });

      toast({
        title: 'Joining meeting...',
        description: currentUser.isHost ? 'Redirecting to host preview' : 'Redirecting to participant preview',
      });

      // Navigate to appropriate preview page based on role
      if (currentUser.isHost) {
        console.log('Navigating to host-preview');
        navigate(`/meeting/${meeting.id}/host-preview`);
      } else {
        console.log('Navigating to participant-preview');
        navigate(`/meeting/${meeting.id}/participant-preview`);
      }

      setIsJoining(false);
    } else {
      console.log('Navigation condition failed:', {
        hasIsJoining: !!isJoining,
        hasMeeting: !!meeting,
        hasMeetingId: !!(meeting?.id),
        hasCurrentUser: !!currentUser
      });
    }
  }, [isJoining, meeting, currentUser, navigate, toast]);

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
      setIsCreating(true);
      await createMeeting({ title: 'Quick Meeting' });
      // Navigation happens in useEffect after meeting is created
    } catch (err) {
      setIsCreating(false);
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
          <CardDescription>
            Enter your nickname to get started
          </CardDescription>
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
            <CardDescription>
              Start a new meeting room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomId && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Room Code:</p>
                <p className="text-lg font-mono font-semibold">{roomId}</p>
              </div>
            )}
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
          </CardContent>
        </Card>

        {/* Join Room Card */}
        <Card>
          <CardHeader>
            <CardTitle>Join Room</CardTitle>
            <CardDescription>
              Enter a room code to join
            </CardDescription>
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
