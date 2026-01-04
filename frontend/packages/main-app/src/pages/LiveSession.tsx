/**
 * LiveSession Page
 * Main room view with 3D viewer and participant management
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoomStore } from '@/stores/roomStore';
import { useToast } from '@/hooks/use-toast';
import { useParticipantSync } from '@/hooks/useParticipantSync';
import { ViewerArea } from '@/components/ViewerArea';
import { WaitingRoomPanel } from '@/components/WaitingRoomPanel';
import { ControlBar } from '@/components/ControlBar';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ParticipantListSidebar } from '@/components/ParticipantListSidebar';
import { SettingsModal } from '@/components/SettingsModal';
import { LeaveConfirmDialog, EndRoomDialog } from '@/components/ConfirmDialogs';
import { Loader2 } from 'lucide-react';
import { getInstance as getWebSocketController } from '@animal-zoom/shared/socket';

export function LiveSession() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { room, currentUser, participants } = useRoomStore();

  // UI State
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Ensure WebSocket is connected and room is joined
  useEffect(() => {
    if (!room?.code) return;

    const wsController = getWebSocketController();

    console.log('[LiveSession] Checking WebSocket connection...');

    // Connect to WebSocket if not already connected
    if (!wsController.isConnected()) {
      console.log('[LiveSession] Connecting to WebSocket...');
      wsController.connect();
    } else {
      // Already connected, join room immediately
      console.log('[LiveSession] Already connected, joining room:', room.code);
      wsController.joinRoom(room.code);
    }

    // Join room when connected
    const connectedSub = wsController.connected$.subscribe(() => {
      console.log('[LiveSession] WebSocket connected, joining room:', room.code);
      wsController.joinRoom(room.code);
    });

    return () => {
      connectedSub.unsubscribe();
      // Keep connection alive - don't disconnect
    };
  }, [room?.code]);

  // Enable real-time participant synchronization
  useParticipantSync(roomId, true);

  useEffect(() => {
    if (!room || room.id !== roomId) {
      navigate('/');
      return;
    }

    if (room.state !== 'LIVE') {
      navigate(`/room/${roomId}/host-preview`);
      return;
    }

    if (currentUser?.joinState !== 'JOINED') {
      navigate(`/room/${roomId}/participant-preview`);
    }
  }, [room, roomId, currentUser, navigate]);

  // Handle room end
  useEffect(() => {
    if (room?.state === 'ENDED') {
      navigate('/');
    }
  }, [room?.state, navigate]);

  if (!room || !currentUser) {
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

          {/* Room Info Overlay */}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border">
            <h2 className="font-semibold text-sm">{room.title}</h2>
            {room.code && (
              <p className="text-xs text-muted-foreground font-mono">
                Room Code: <span className="font-semibold text-foreground">{room.code}</span>
              </p>
            )}
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
        {isHost && room.waitingRoomEnabled && showWaitingRoom && (
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
        onEndRoom={() => setShowEndDialog(true)}
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

      <EndRoomDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
      />
    </div>
  );
}
