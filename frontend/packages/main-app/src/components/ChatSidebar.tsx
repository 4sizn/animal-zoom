/**
 * ChatSidebar Component
 * Chat interface with shadcn styling (integrates with @animal-zoom/chat-ui)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMeetingStore } from '@/stores/meetingStore';
import { X, Send } from 'lucide-react';
import { useState } from 'react';

interface ChatSidebarProps {
  onClose?: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { meeting, currentUser } = useMeetingStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
  }>>([]);

  // TODO: Integrate with @animal-zoom/chat-ui
  // Expected integration:
  // import { ChatContainer } from '@animal-zoom/chat-ui';
  //
  // <ChatContainer
  //   roomId={meeting?.id}
  //   userId={currentUser?.id}
  //   userName={currentUser?.name}
  //   theme="shadcn" // Custom theme
  // />

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    // TODO: Send message via WebSocket
    // For now, add to local state as placeholder
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Chat</CardTitle>
            <CardDescription>Send messages to everyone</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUser?.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
              >
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-medium">{msg.senderName}</span>
                  </div>
                )}

                <div
                  className={`
                    max-w-[80%] rounded-lg px-3 py-2
                    ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }
                  `}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p
                    className={`
                      text-xs mt-1
                      ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                    `}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            disabled={!currentUser}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || !currentUser}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Integration Note */}
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
          <p className="font-medium mb-1">Integration Ready</p>
          <p className="text-blue-700 dark:text-blue-300">
            Replace this placeholder with ChatContainer from @animal-zoom/chat-ui for full WebSocket integration
          </p>
        </div>
      </div>
    </Card>
  );
}
