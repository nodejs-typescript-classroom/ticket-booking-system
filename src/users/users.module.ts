import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserStore } from './users.store';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';

@Module({
  providers: [UsersService, UserStore, JwtAuthGuard, JwtAuthStrategy],
  controllers: [UsersController],
  exports: [UsersService, UserStore]
})
export class UsersModule {}
