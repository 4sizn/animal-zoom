import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  displayName: string;
}
