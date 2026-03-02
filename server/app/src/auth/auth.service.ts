import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import type { PublicUser } from "../users/users.service";
import { UsersService } from "../users/users.service";

void JwtService;
void UsersService;

export type JwtPayload = {
  sub: number;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(input: { email: string; password: string }): Promise<{ accessToken: string; user: PublicUser }> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException("invalid credentials");
    }

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException("invalid credentials");
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      }
    };
  }
}
