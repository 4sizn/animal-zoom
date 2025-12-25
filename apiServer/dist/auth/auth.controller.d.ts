import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto, CreateGuestDto } from './dto/index.js';
import { User } from '../database/schema/index.js';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./dto/auth-response.dto.js").AuthResponseDto>;
    login(dto: LoginDto): Promise<import("./dto/auth-response.dto.js").AuthResponseDto>;
    createGuest(dto: CreateGuestDto): Promise<import("./dto/auth-response.dto.js").AuthResponseDto>;
    me(user: Omit<User, 'password'>): Promise<{
        id: string;
        type: import("../database/schema/users.js").UserType;
        username: string | null;
        email: string | null;
        displayName: string | null;
        avatarCustomization: {
            modelUrl?: string;
            colors?: {
                primary?: string;
                secondary?: string;
            };
            accessories?: string[];
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
