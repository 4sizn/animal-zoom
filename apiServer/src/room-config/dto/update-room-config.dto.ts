import {
  IsOptional,
  IsString,
  Matches,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum LightingPreset {
  DEFAULT = 'default',
  BRIGHT = 'bright',
  DIM = 'dim',
  WARM = 'warm',
  COOL = 'cool',
  DRAMATIC = 'dramatic',
}

export class UpdateRoomConfigDto {
  @IsOptional()
  @IsEnum(LightingPreset)
  lightingPreset?: LightingPreset;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Floor color must be a valid hex color (e.g., #8B4513)',
  })
  floorColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Wall color must be a valid hex color (e.g., #ffffff)',
  })
  wallColor?: string;

  @IsOptional()
  @IsArray()
  furniture?: string[];

  @IsOptional()
  @IsArray()
  decorations?: string[];
}

export interface RoomConfig {
  lightingPreset: LightingPreset;
  floorColor: string | null;
  wallColor: string | null;
  furniture: string[];
  decorations: string[];
}
