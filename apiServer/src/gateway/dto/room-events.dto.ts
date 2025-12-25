import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class JoinRoomEventDto {
  @IsString()
  @IsNotEmpty()
  roomCode: string;
}

export class LeaveRoomEventDto {
  @IsString()
  @IsNotEmpty()
  roomCode: string;
}

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  roomCode: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SyncStateDto {
  @IsString()
  @IsNotEmpty()
  roomCode: string;

  @IsOptional()
  position?: { x: number; y: number; z: number };

  @IsOptional()
  rotation?: { x: number; y: number; z: number };

  @IsOptional()
  avatarState?: any;
}
