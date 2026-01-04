/**
 * ParticipantPreview Page
 * Pre-join screen for participants showing room info
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoomStore } from '@/stores/roomStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Video, Clock } from 'lucide-react';
import { getInstance as getWebSocketController } from '@animal-zoom/shared/socket';

export function ParticipantPreview() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { room, currentUser, participants, updateUserJoinState } = useRoomStore();

  // Connect to WebSocket when entering preview (but don't sync yet)
  useEffect(() => {
    const wsController = getWebSocketController();

    // Connect to WebSocket if not already connected
    if (!wsController.isConnected()) {
      console.log('[ParticipantPreview] Connecting to WebSocket...');
      wsController.connect();
    }

    // Join room when connected
    const connectedSub = wsController.connected$.subscribe(() => {
      if (room?.code) {
        console.log('[ParticipantPreview] WebSocket connected, joining room:', room.code);
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
    // Redirect if no room or wrong room
    if (!room || room.id !== roomId) {
      toast({
        title: 'Room not found',
        description: 'Redirecting to join page...',
        variant: 'destructive',
      });
      navigate('/join');
    }
  }, [room, roomId, navigate, toast]);

  if (!room || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleJoinRoom = () => {
    if (room.waitingRoomEnabled) {
      // Go to waiting room
      updateUserJoinState('WAITING');
      toast({
        title: 'Entering waiting room',
        description: 'Please wait for the host to admit you',
      });
      navigate(`/room/${room.id}/waiting`);
    } else {
      // Join directly
      updateUserJoinState('JOINED');
      toast({
        title: 'Joining room',
        description: 'Entering live session...',
      });
      navigate(`/room/${room.id}/session`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{room.title}</h1>
        <p className="text-muted-foreground">
          You're about to join this room
        </p>
      </div>

      {/* Main Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Room Preview</CardTitle>
          <CardDescription>
            Review the room information before joining
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview Area - Placeholder for 3D viewer */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <Video className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                3D viewer preview
              </p>
              <p className="text-xs text-muted-foreground">
                You'll join as: <span className="font-semibold">{currentUser.name}</span>
              </p>
            </div>
          </div>

          {/* Room Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Host</p>
                  <p className="text-sm text-muted-foreground">{room.hostName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(room.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Room Code</p>
                <code className="px-3 py-2 bg-muted rounded text-primary font-mono text-sm">
                  {room.code}
                </code>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Participants</p>
                <p className="text-sm text-muted-foreground">
                  {participants.length} {participants.length === 1 ? 'person' : 'people'} in room
                </p>
              </div>
            </div>
          </div>

          {/* Waiting Room Notice */}
          {room.waitingRoomEnabled && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-200 text-sm">
                    Waiting Room Enabled
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    The host will need to admit you before you can join the room
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              size="lg"
              onClick={handleJoinRoom}
              className="flex-1"
            >
              <Video className="mr-2 h-4 w-4" />
              {room.waitingRoomEnabled ? 'Join Waiting Room' : 'Join Room'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/join')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Display Name</p>
              <p className="text-sm text-muted-foreground">
                How you'll appear to others
              </p>
            </div>
            <span className="font-medium text-primary">{currentUser.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                Your current presence
              </p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              Ready to Join
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
