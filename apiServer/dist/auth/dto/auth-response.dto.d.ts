import { User } from '../../database/schema/index.js';
export declare class AuthResponseDto {
    accessToken: string;
    user: Omit<User, 'password'>;
}
