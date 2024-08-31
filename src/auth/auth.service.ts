import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../users/schema/user.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async login(user: UserEntity): Promise<LoginResponseDto> {
    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() + this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_MS')
    );
    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() + this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_MS')
    );
    const tokenPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
    };
    const [accessToken, refreshToken]  = await Promise.all([this.jwtService.sign(tokenPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    }), this.jwtService.sign(tokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    })]);
    // update current user with new refresh Token
    await this.userService.updateUser({id: user.id}, {refreshToken: 
      await bcrypt.hash(refreshToken, 10),
    })
    return {
      refresh_token: refreshToken,
      access_token: accessToken,
    }
  }
  async verifyUser(email: string, password: string): Promise<UserEntity> {
    try {
      const user = await this.userService.findUser({
        email
      });
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch(error) {
      throw new UnauthorizedException('Credentials are not valid.');
    }    
  }
  async refreshToken(refreshToken: string, userId: string): Promise<UserEntity> {
    try {
      const user = await this.userService.findUser({ id: userId});
      const authenticated = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Refresh Token is not valid');
    }
  }
}
