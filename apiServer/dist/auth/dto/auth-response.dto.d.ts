import { User } from '../../database/schema';
export declare class AuthResponseDto {
    accessToken: string;
    user: Omit<User, 'password'>;
}
