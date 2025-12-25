var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ConflictException, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service.js';
import { PasswordService } from './password.service.js';
let AuthService = class AuthService {
    db;
    jwtService;
    passwordService;
    configService;
    constructor(db, jwtService, passwordService, configService) {
        this.db = db;
        this.jwtService = jwtService;
        this.passwordService = passwordService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.db.db
            .selectFrom('users')
            .selectAll()
            .where((eb) => eb.or([eb('username', '=', dto.username), eb('email', '=', dto.email)]))
            .executeTakeFirst();
        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }
        const hashedPassword = await this.passwordService.hash(dto.password);
        const user = await this.db.db
            .insertInto('users')
            .values({
            type: 'registered',
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
            displayName: dto.displayName,
            updatedAt: new Date(),
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        const accessToken = this.generateToken(user.id, dto.username, 'registered');
        const { password: _password, ...userWithoutPassword } = user;
        return {
            accessToken,
            user: userWithoutPassword,
        };
    }
    async login(dto) {
        const user = await this.db.db
            .selectFrom('users')
            .selectAll()
            .where('username', '=', dto.username)
            .executeTakeFirst();
        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const accessToken = this.generateToken(user.id, user.username, user.type);
        const { password: _password, ...userWithoutPassword } = user;
        return {
            accessToken,
            user: userWithoutPassword,
        };
    }
    async createGuest(dto) {
        const user = await this.db.db
            .insertInto('users')
            .values({
            type: 'guest',
            displayName: dto.displayName,
            updatedAt: new Date(),
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        const payload = {
            sub: user.id,
            username: user.displayName,
            type: 'guest',
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '24h',
        });
        const { password: _password, ...userWithoutPassword } = user;
        return {
            accessToken,
            user: userWithoutPassword,
        };
    }
    async me(userId) {
        const user = await this.db.db
            .selectFrom('users')
            .selectAll()
            .where('id', '=', userId)
            .executeTakeFirst();
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const { password: _password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    generateToken(userId, username, type) {
        const payload = {
            sub: userId,
            username,
            type,
        };
        return this.jwtService.sign(payload);
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DatabaseService,
        JwtService,
        PasswordService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map