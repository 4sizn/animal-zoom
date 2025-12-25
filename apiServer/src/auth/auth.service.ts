import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { PasswordService } from './password.service';
import { RegisterDto, LoginDto, CreateGuestDto, AuthResponseDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.db.db
      .selectFrom('users')
      .selectAll()
      .where((eb) =>
        eb.or([eb('username', '=', dto.username), eb('email', '=', dto.email)]),
      )
      .executeTakeFirst();

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Create user
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

    // Generate JWT token
    const accessToken = this.generateToken(user.id, dto.username, 'registered');

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Login with username and password
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user by username
    const user = await this.db.db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', dto.username)
      .executeTakeFirst();

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = this.generateToken(user.id, user.username!, user.type);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Create a guest user
   */
  async createGuest(dto: CreateGuestDto): Promise<AuthResponseDto> {
    // Create guest user
    const user = await this.db.db
      .insertInto('users')
      .values({
        type: 'guest',
        displayName: dto.displayName,
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Generate JWT token with shorter expiration
    const payload: JwtPayload = {
      sub: user.id,
      username: user.displayName!,
      type: 'guest',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Get current user info
   */
  async me(userId: string) {
    const user = await this.db.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Generate JWT token
   */
  private generateToken(
    userId: string,
    username: string,
    type: 'registered' | 'guest',
  ): string {
    const payload: JwtPayload = {
      sub: userId,
      username,
      type,
    };

    return this.jwtService.sign(payload);
  }
}
