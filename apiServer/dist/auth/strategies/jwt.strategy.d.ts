import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service.js';
export interface JwtPayload {
    sub: string;
    username: string;
    type: 'registered' | 'guest';
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private db;
    constructor(configService: ConfigService, db: DatabaseService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        type: import("../../database/schema/users.js").UserType;
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
export {};
