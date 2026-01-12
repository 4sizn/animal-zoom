import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type ParticipantRole = 'host' | 'participant';
export type ParticipantStatus = 'waiting' | 'joined' | 'rejected';

export interface RoomParticipantsTable {
  id: Generated<string>;
  userId: string;
  roomId: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  isActive: boolean;
  joinedAt: Date | null;
  leftAt: Date | null;
  createdAt: Generated<Date>;
}

export type RoomParticipant = Selectable<RoomParticipantsTable>;
export type NewRoomParticipant = Insertable<RoomParticipantsTable>;
export type RoomParticipantUpdate = Updateable<RoomParticipantsTable>;
