import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventStore } from './event.store';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ UsersModule],
  providers: [EventsService, EventStore, JwtAuthGuard, JwtAuthStrategy],
  controllers: [EventsController]
})
export class EventsModule {}
