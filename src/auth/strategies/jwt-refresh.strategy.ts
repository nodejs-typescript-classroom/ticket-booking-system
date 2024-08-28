import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { TokenPayload } from '../token-payload.interface';
@Injectable()
export class JwtFreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request.headers?.authorization as string;
          return token;
        }
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true
    });
  }
  async validate(request: Request, tokenPayload: TokenPayload) {
    return this.authService.refreshToken(request.headers?.authorization as string, tokenPayload.userId)
  }
}