import { User } from '../../database/schema/index.js';

export class AuthResponseDto {
  accessToken: string;
  user: Omit<User, 'password'>;
}
