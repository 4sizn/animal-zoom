/**
 * ChatSidebar Component
 * Chat interface integrating @animal-zoom/chat-ui
 */

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/stores/roomStore';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { ChatContainer, useChatStore } from '@animal-zoom/chat-ui';
import { getInstance as getWebSocketController } from '@animal-zoom/shared/socket';
import '@animal-zoom/chat-ui/styles';

interface ChatSidebarProps {
  onClose?: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { room, currentUser } = useRoomStore();
  const { setUser, setRoomId, connectWebSocket, joinRoom } = useChatStore();

  // Initialize chat store when room/user are available
  useEffect(() => {
    if (currentUser && room) {
      // Set user info in chat store
      setUser(currentUser.id, currentUser.name);

      // Set room ID
      setRoomId(room.id);

      const wsController = getWebSocketController();

      // Connect to WebSocket if not already connected
      if (!wsController.isConnected()) {
        connectWebSocket();
      }

      // Join the room when WebSocket is connected
      const subscription = wsController.connected$.subscribe(() => {
        console.log('[ChatSidebar] WebSocket connected, joining room:', room.code);
        joinRoom(room.code);
      });

      // If already connected, join immediately
      if (wsController.isConnected()) {
        console.log('[ChatSidebar] Already connected, joining room:', room.code);
        joinRoom(room.code);
      }

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser?.id, currentUser?.name, room?.id, room?.code, setUser, setRoomId, connectWebSocket, joinRoom]);

  // Don't render if no user or room
  if (!currentUser || !room) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Chat</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      {/* Optional Header with Close Button */}
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Chat</h3>
            <p className="text-sm text-muted-foreground">Send messages to everyone</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Integrated ChatContainer from @animal-zoom/chat-ui */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer className="h-full" />
      </div>
    </div>
  );
}
