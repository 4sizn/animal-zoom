import { IsOptional, IsString, Matches, IsArray } from 'class-validator';

export class UpdateAvatarDto {
  @IsOptional()
  @IsString()
  modelUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Primary color must be a valid hex color (e.g., #ff0000)',
  })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Secondary color must be a valid hex color (e.g., #00ff00)',
  })
  secondaryColor?: string;

  @IsOptional()
  @IsArray()
  accessories?: string[];
}

export interface AvatarConfig {
  modelUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accessories: string[];
}
