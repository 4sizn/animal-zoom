/**
 * HostPreview Page
 * Pre-meeting setup screen for host before starting the live session
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Video, CheckCircle2, Loader2 } from 'lucide-react';
import { getInstance as getWebSocketController } from '@animal-zoom/shared/socket';

export function HostPreview() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { meeting, startMeeting, isLoading } = useMeetingStore();
  const [copied, setCopied] = useState(false);

  // Connect to WebSocket when entering preview (but don't sync yet)
  useEffect(() => {
    const wsController = getWebSocketController();

    // Connect to WebSocket if not already connected
    if (!wsController.isConnected()) {
      console.log('[HostPreview] Connecting to WebSocket...');
      wsController.connect();
    }

    // Join room when connected
    const connectedSub = wsController.connected$.subscribe(() => {
      if (meeting?.code) {
        console.log('[HostPreview] WebSocket connected, joining room:', meeting.code);
        wsController.joinRoom(meeting.code);
      }
    });

    return () => {
      connectedSub.unsubscribe();
      // Keep connection alive - don't disconnect
      // Synchronization will be enabled in LiveSession
    };
  }, [meeting?.code]);

  useEffect(() => {
    // Redirect if no meeting or wrong meeting
    if (!meeting || meeting.id !== meetingId) {
      toast({
        title: 'Meeting not found',
        description: 'Redirecting to dashboard...',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [meeting, meetingId, navigate, toast]);

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const meetingUrl = `${window.location.origin}/join/${meeting.code}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Meeting link has been copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleStartMeeting = () => {
    startMeeting();
    toast({
      title: 'Meeting started!',
      description: 'Entering live session...',
    });
    navigate(`/meeting/${meeting.id}/session`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{meeting.title}</h1>
        <p className="text-muted-foreground">
          You're about to start a new meeting
        </p>
      </div>

      {/* Main Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Preview</CardTitle>
          <CardDescription>
            Review your meeting settings before starting
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

          {/* Meeting Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Meeting Code:</span>
                <code className="px-2 py-1 bg-muted rounded text-primary font-mono">
                  {meeting.code}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className="font-medium">Waiting Room:</span>
                <span className="text-muted-foreground">
                  {meeting.waitingRoomEnabled ? 'Enabled' : 'Disabled'}
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
                    value={meetingUrl}
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
              onClick={handleStartMeeting}
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
                  Start Meeting
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Waiting Room</p>
              <p className="text-sm text-muted-foreground">
                Participants wait for your approval
              </p>
            </div>
            <span className={meeting.waitingRoomEnabled ? 'text-green-600' : 'text-muted-foreground'}>
              {meeting.waitingRoomEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Meeting State</p>
              <p className="text-sm text-muted-foreground">
                Current status of your meeting
              </p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
              {meeting.state}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
