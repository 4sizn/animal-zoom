/**
 * ControlBar Component
 * Bottom control bar with room controls (Zoom-like)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/stores/roomStore';
import {
  MessageSquare,
  Users,
  Settings,
  LogOut,
  PhoneOff,
  ChevronUp,
} from 'lucide-react';

interface ControlBarProps {
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
  onEndRoom: () => void;
  chatUnreadCount?: number;
}

export function ControlBar({
  onToggleChat,
  onToggleParticipants,
  onOpenSettings,
  onLeave,
  onEndRoom,
  chatUnreadCount = 0,
}: ControlBarProps) {
  const { currentUser, participants } = useRoomStore();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const isHost = currentUser?.isHost || false;

  const ControlButton = ({
    icon: Icon,
    label,
    onClick,
    badge,
    variant = 'ghost',
  }: {
    icon: any;
    label: string;
    onClick: () => void;
    badge?: number;
    variant?: 'ghost' | 'destructive';
  }) => (
    <div className="relative">
      <Button
        variant={variant}
        size="lg"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(label)}
        onMouseLeave={() => setShowTooltip(null)}
        className="flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-muted/50"
      >
        <div className="relative">
          <Icon className="h-5 w-5" />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        <span className="text-xs">{label}</span>
      </Button>

      {/* Tooltip */}
      {showTooltip === label && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border whitespace-nowrap">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <ChevronUp className="h-3 w-3 text-popover fill-current" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left Section - Room Info */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{participants.length}</span> participant
            {participants.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Center Section - Main Controls */}
        <div className="flex items-center gap-2">
          <ControlButton
            icon={MessageSquare}
            label="Chat"
            onClick={onToggleChat}
            badge={chatUnreadCount}
          />

          <ControlButton
            icon={Users}
            label="Participants"
            onClick={onToggleParticipants}
          />

          <ControlButton
            icon={Settings}
            label="Settings"
            onClick={onOpenSettings}
          />
        </div>

        {/* Right Section - Leave/End Room */}
        <div className="flex items-center gap-2">
          {isHost ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={onEndRoom}
              className="flex items-center gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Room
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="lg"
              onClick={onLeave}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Leave
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
