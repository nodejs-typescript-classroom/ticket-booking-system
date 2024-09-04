import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto, EventsResponse, PageInfoRequestDto } from '../src/events/dto/event.dto';
import { EventsRepository } from '../src/events/events.repository';
import { EventEntity } from '../src/events/schema/event.entity';
@Injectable()
export class EventStore implements EventsRepository {
  events: EventEntity[] = new Array<EventEntity>();
  async save(eventInfo: CreateEventDto): Promise<EventEntity> {
    const event = new EventEntity();
    event.id = crypto.randomUUID();
    event.location = eventInfo.location;
    event.name = eventInfo.name;
    event.startDate = eventInfo.startDate;
    if (eventInfo.numberOfDays) {
      event.numberOfDays = eventInfo.numberOfDays;
    }
    this.events.push(event);
    return event;
  }
  async findOne(criteria: Partial<EventEntity>): Promise<EventEntity> {
    const foundIdx = this.events.findIndex((item) => item.id == criteria.id);
    if (foundIdx == -1) {
      throw new NotFoundException(`event with given id: ${criteria.id} not found`);
    }
    return this.events[foundIdx];
  }
  async find(criteria: Partial<EventEntity>, pageInfo: PageInfoRequestDto): Promise<EventsResponse> {
    let filteredEvent: EventEntity[] = this.events.slice(pageInfo.offset, pageInfo.limit);
    if (criteria.location) {
      filteredEvent = filteredEvent.filter((item) => item.location == criteria.location);
    }
    if (criteria.startDate) {
      filteredEvent = filteredEvent.filter((item) => item.startDate.getTime() >= criteria.startDate.getTime())
    }
    if (criteria.name) {
      filteredEvent = filteredEvent.filter((item) => item.name == criteria.name)
    }
    return {
      events: filteredEvent,
      pageInfo: {
        limit: pageInfo.limit,
        offset: pageInfo.offset,
        total: filteredEvent.length 
      }
    }
    
  }
  async update(criteria: Partial<EventEntity>, data: Partial<EventEntity>): Promise<EventEntity> {
    const updateIdx = this.events.findIndex((item) => item.id == criteria.id);
    if (updateIdx == -1) {
      throw new NotFoundException(`update target with eventid ${criteria.id} not found`);
    }
    if (data.location) {
      this.events[updateIdx].location = data.location;
    }
    if (data.name) {
      this.events[updateIdx].name = data.name;
    }
    if (data.startDate) {
      this.events[updateIdx].startDate = data.startDate;
    }
    if (data.numberOfDays) {
      this.events[updateIdx].numberOfDays = data.numberOfDays;
    }
    return this.events[updateIdx];
  }
  async delete(criteria: Partial<EventEntity>): Promise<string> {
    const deleteIdx = this.events.findIndex((item) => item.id == criteria.id);
    if (deleteIdx == -1) {
      throw new NotFoundException(`update target with eventid ${criteria.id} not found`);
    }
    const deleteId = this.events[deleteIdx].id;
    this.events.splice(deleteIdx, 1);
    return deleteId;   
  }

}