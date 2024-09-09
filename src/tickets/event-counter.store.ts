import { Injectable, NotFoundException } from '@nestjs/common';
import { EventCounterRespository } from './event-counter.repository';
import { EventCounterEntity } from './schema/event-counter.entity';
@Injectable()
export class EventCounterStore implements EventCounterRespository {
  store: Map<string, EventCounterEntity> = new Map<string, EventCounterEntity>();
  async get(eventId: string): Promise<EventCounterEntity> {
    if (!this.store.has(eventId)) {
      throw new NotFoundException('event id not initial or not existed');
    }
    return this.store.get(eventId);
  }
  async verifyIncr(eventId: string, ticketNumber: number, accumAttendee: number, accumTicket: number): Promise<EventCounterEntity> {
    if (!this.store.has(eventId)) {
      const counter = new EventCounterEntity();
      counter.eventId = eventId;
      counter.totalTicketNumber = accumTicket;
      counter.attendeeNumber = accumAttendee + ticketNumber;
      this.store.set(eventId, counter);
    } else {
      this.store.get(eventId).attendeeNumber += ticketNumber;
    }
    return this.store.get(eventId);
  }
  async ticketIncr(eventId: string, ticketNumber: number, accumAttendee: number, accumTicket: number): Promise<EventCounterEntity> {
    if (!this.store.has(eventId)) {
      const counter = new EventCounterEntity();
      counter.eventId = eventId;
      counter.totalTicketNumber = accumTicket + ticketNumber;
      counter.attendeeNumber = accumAttendee;
      this.store.set(eventId, counter);
    } else {
      this.store.get(eventId).totalTicketNumber += ticketNumber;
    }
    return this.store.get(eventId);
  }
}