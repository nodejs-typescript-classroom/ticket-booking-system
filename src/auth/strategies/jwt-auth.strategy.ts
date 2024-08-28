import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { TokenPayload } from '../token-payload.interface';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request.headers?.authorization as string;
          return token;
        }
      ]),
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    })
  }
  async validate(tokenPayload: TokenPayload) {
    return this.usersService.findUser({id: tokenPayload.userId })
  }
}