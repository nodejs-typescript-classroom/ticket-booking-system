import { Inject, Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventStore } from './event.store';
import { CreateEventDto, GetEventDto, GetEventsDto, PageInfoRequestDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EventStore)
    private readonly eventRepo: EventsRepository
  ) {}
  async createEvent(eventInfo: CreateEventDto) {
    const result = await this.eventRepo.save(eventInfo);
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
