import { User } from '../../database/schema';

export class AuthResponseDto {
  accessToken: string;
  user: Omit<User, 'password'>;
}
