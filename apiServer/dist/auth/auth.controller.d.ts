import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CreateGuestDto } from './dto';
import { User } from '../database/schema';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./dto").AuthResponseDto>;
    login(dto: LoginDto): Promise<import("./dto").AuthResponseDto>;
    createGuest(dto: CreateGuestDto): Promise<import("./dto").AuthResponseDto>;
    me(user: Omit<User, 'password'>): Promise<{
        id: string;
        type: import("../database/schema").UserType;
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
