import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtFreshStrategy as JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule,
    PassportModule,
  ],
  providers: [UsersService, AuthService, LocalStrategy, JwtRefreshStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
