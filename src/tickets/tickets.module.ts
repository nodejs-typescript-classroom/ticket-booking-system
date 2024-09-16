import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EventsCounterService } from './events-counter.service';
import { EventCounterStore } from './event-counter.store';
import { TicketDbStore } from './ticket-db.store';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './schema/ticket.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([TicketEntity])],
  providers: [TicketsService, EventsCounterService, EventCounterStore, TicketDbStore],
  controllers: [TicketsController]
})
export class TicketsModule {}
