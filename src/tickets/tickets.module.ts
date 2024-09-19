import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EventsCounterService } from './events-counter.service';
import { TicketDbStore } from './ticket-db.store';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './schema/ticket.entity';
import { RedisService } from './redis.service';
import { EventCounterRedisStore } from './event-couter.redis.store';

@Module({
  imports: [ TypeOrmModule.forFeature([TicketEntity])],
  providers: [TicketsService, EventsCounterService, TicketDbStore, 
    RedisService, EventCounterRedisStore,
  ],
  controllers: [TicketsController]
})
export class TicketsModule {}
