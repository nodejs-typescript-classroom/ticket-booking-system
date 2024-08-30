import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './schema/user.entity';
import { UserDBStore } from './users-db.store';

@Module({
  imports: [ TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, JwtAuthGuard, JwtAuthStrategy, UserDBStore],
  controllers: [UsersController],
  exports: [UsersService, UserDBStore]
})
export class UsersModule {}
