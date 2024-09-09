import { Inject, Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto, GetEventDto, GetEventsDto, UpdateEventDto } from './dto/event.dto';
import { EventDbStore } from './event-db.store';
import { PageInfoRequestDto } from '../pagination.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCounterEvent } from '../tickets/dto/ticket.event';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EventDbStore)
    private readonly eventRepo: EventsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async createEvent(eventInfo: CreateEventDto) {
    const result = await this.eventRepo.save(eventInfo);
    const createCountEvent = new CreateCounterEvent(); 
    createCountEvent.eventId = result.id;
    this.eventEmitter.emit('create-counter-event', createCountEvent)
    return {id: result.id};
  }
  async getEvent(userInfo: GetEventDto) {
    return this.eventRepo.findOne(userInfo);
  }
  async getEvents(criteria: GetEventsDto, pageInfo: PageInfoRequestDto) {
    return this.eventRepo.find(criteria, pageInfo);
  }
  async updateEvent(eventId: string, updateData: UpdateEventDto) {
    return this.eventRepo.update({id: eventId},updateData);
  }
  async deleteEvent(eventId: string) {
    return this.eventRepo.delete({ id: eventId});
  }
}
