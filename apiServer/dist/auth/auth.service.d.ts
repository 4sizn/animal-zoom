import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { PasswordService } from './password.service';
import { RegisterDto, LoginDto, CreateGuestDto, AuthResponseDto } from './dto';
export declare class AuthService {
    private db;
    private jwtService;
    private passwordService;
    private configService;
    constructor(db: DatabaseService, jwtService: JwtService, passwordService: PasswordService, configService: ConfigService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    createGuest(dto: CreateGuestDto): Promise<AuthResponseDto>;
    me(userId: string): Promise<{
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
    private generateToken;
}
