import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EventsCounterService } from './events-counter.service';
import { TicketsStore } from './tickets.store';
import { EventCounterStore } from './event-counter.store';

@Module({
  providers: [TicketsService, EventsCounterService, TicketsStore, EventCounterStore],
  controllers: [TicketsController]
})
export class TicketsModule {}
