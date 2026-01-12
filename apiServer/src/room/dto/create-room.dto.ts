import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(100)
  maxParticipants?: number;

  @IsOptional()
  @IsBoolean()
  waitingRoomEnabled?: boolean;
}
