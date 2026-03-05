import { ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
    _status?: any
  ): TUser {
    if (err || !user) {
      throw new HttpException({ ok: false, error: "unauthorized" }, 401);
    }
    return user as TUser;
  }
}
