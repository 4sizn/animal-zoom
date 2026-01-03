/**
 * LiveSession Page
 * Main meeting view with 3D viewer and participant management
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { useParticipantSync } from '@/hooks/useParticipantSync';
import { ViewerArea } from '@/components/ViewerArea';
import { WaitingRoomPanel } from '@/components/WaitingRoomPanel';
import { ControlBar } from '@/components/ControlBar';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ParticipantListSidebar } from '@/components/ParticipantListSidebar';
import { SettingsModal } from '@/components/SettingsModal';
import { LeaveConfirmDialog, EndMeetingDialog } from '@/components/ConfirmDialogs';
import { Loader2 } from 'lucide-react';

export function LiveSession() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { meeting, currentUser, participants } = useMeetingStore();

  // UI State
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Enable real-time participant synchronization
  useParticipantSync(meetingId, true);

  useEffect(() => {
    // Redirect if no meeting or wrong meeting
    if (!meeting || meeting.id !== meetingId) {
      toast({
        title: 'Meeting not found',
        description: 'Redirecting to dashboard...',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Check if meeting is live
    if (meeting.state !== 'LIVE') {
      toast({
        title: 'Meeting not started',
        description: 'Waiting for host to start the meeting...',
      });
      navigate(`/meeting/${meetingId}/host-preview`);
      return;
    }

    // Check if user has joined
    if (currentUser?.joinState !== 'JOINED') {
      toast({
        title: 'Not in meeting',
        description: 'Please join the meeting first',
      });
      navigate(`/meeting/${meetingId}/participant-preview`);
    }
  }, [meeting, meetingId, currentUser, navigate, toast]);

  // Handle meeting end
  useEffect(() => {
    if (meeting?.state === 'ENDED') {
      toast({
        title: 'Meeting ended',
        description: 'The meeting has ended',
      });
      navigate('/');
    }
  }, [meeting?.state, navigate, toast]);

  if (!meeting || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isHost = currentUser.isHost;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewer Area */}
        <div className="flex-1 relative">
          <ViewerArea
            participants={participants}
            currentUserId={currentUser.id}
          />

          {/* Meeting Info Overlay */}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border">
            <h2 className="font-semibold text-sm">{meeting.title}</h2>
            <p className="text-xs text-muted-foreground">
              {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
            </p>
          </div>
        </div>

        {/* Right Sidebar - Chat */}
        {showChat && (
          <div className="w-80 border-l bg-background overflow-hidden">
            <ChatSidebar onClose={() => setShowChat(false)} />
          </div>
        )}

        {/* Right Sidebar - Participants List */}
        {showParticipants && (
          <div className="w-80 border-l bg-background overflow-hidden">
            <ParticipantListSidebar onClose={() => setShowParticipants(false)} />
          </div>
        )}

        {/* Right Sidebar - Waiting Room (Host Only) */}
        {isHost && meeting.waitingRoomEnabled && showWaitingRoom && (
          <div className="w-80 border-l bg-background overflow-y-auto">
            <div className="p-4">
              <WaitingRoomPanel collapsible={false} />
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <ControlBar
        onToggleChat={() => {
          setShowChat(!showChat);
          setShowParticipants(false);
          setShowWaitingRoom(false);
        }}
        onToggleParticipants={() => {
          setShowParticipants(!showParticipants);
          setShowChat(false);
          setShowWaitingRoom(false);
        }}
        onOpenSettings={() => setShowSettings(true)}
        onLeave={() => setShowLeaveDialog(true)}
        onEndMeeting={() => setShowEndDialog(true)}
        chatUnreadCount={0} // TODO: Track unread messages
      />

      {/* Modals and Dialogs */}
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <LeaveConfirmDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
      />

      <EndMeetingDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
      />
    </div>
  );
}
