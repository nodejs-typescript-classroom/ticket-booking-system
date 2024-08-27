import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserStore } from './users.store';

@Module({
  providers: [UsersService, UserStore],
  controllers: [UsersController],
  exports: [UsersService, UserStore]
})
export class UsersModule {}
