import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './schema/event.entity';
import { EventDbStore } from './event-db.store';
import { EventCounterRedisStore } from '../tickets/event-couter.redis.store';
import { RedisService } from '../tickets/redis.service';

@Module({
  imports: [ UsersModule, TypeOrmModule.forFeature([EventEntity])],
  providers: [EventsService, JwtAuthGuard, JwtAuthStrategy, EventDbStore, EventCounterRedisStore, RedisService],
  controllers: [EventsController]
})
export class EventsModule {}
