import { Inject, Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto, EventResponse, EventsResponseDto, GetEventDto, GetEventsDto, UpdateEventDto } from './dto/event.dto';
import { EventDbStore } from './event-db.store';
import { PageInfoRequestDto } from '../pagination.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCounterEvent } from '../tickets/dto/ticket.event';
import { EventCounterRedisStore } from '../tickets/event-couter.redis.store';
import { EventCounterRespository } from '../tickets/event-counter.repository';
import { ApiResponse } from '../api-response.dto';
import { EventCounterEntity } from '../tickets/schema/event-counter.entity';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EventDbStore)
    private readonly eventRepo: EventsRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(EventCounterRedisStore)
    private readonly eventCounterRepo: EventCounterRespository,
  ) {}
  async createEvent(eventInfo: CreateEventDto): Promise<ApiResponse<{id:string}>> {
    const result = await this.eventRepo.save(eventInfo);
    const createCountEvent = new CreateCounterEvent(); 
    createCountEvent.eventId = result.id;
    this.eventEmitter.emit('create-counter-event', createCountEvent)
    return {
      message: 'event create success',
      data: {
        id: result.id
      }
    }
  }
  async getEvent(evnetInfo: GetEventDto): Promise<ApiResponse<EventResponse>> {
    const [event, counter] = await Promise.all([
      this.eventRepo.findOne(evnetInfo),
      this.eventCounterRepo.get(evnetInfo.id)
    ]);
    return {
      message: 'event fetch success',
      data: {
        ...event,
        totalTicketsPurchased: counter.totalTicketNumber,
        totalTicketsEntered: counter.attendeeNumber
      }
    }
  }
  async getEvents(criteria: GetEventsDto, pageInfo: PageInfoRequestDto):Promise<ApiResponse<EventsResponseDto>> {
    const result = await this.eventRepo.find(criteria, pageInfo);
    const events = result.events;
    const page = result.pageInfo;
    const reqs:Promise<EventCounterEntity>[] = [];
    events.forEach(event => {
      reqs.push(this.eventCounterRepo.get(event.id));
    });
    const results = await Promise.all(reqs);
    
    return {
      message: 'fetch event success',
      data: {
        events: events.map((event, idx:number) =>{
          return {
            ...event,
            totalTicketsEntered: results[idx].attendeeNumber,
            totalTicketsPurchased: results[idx].totalTicketNumber
          }
        }),
        pageInfo: page,
      }
    }
  }
  async updateEvent(eventId: string, updateData: UpdateEventDto): Promise<ApiResponse<EventResponse>>  {
    const [event, counter] = await Promise.all([
      this.eventRepo.update({id: eventId},updateData),
      this.eventCounterRepo.get(eventId)
    ]);
    return {
      message: 'update event success',
      data: {
        ...event,
        totalTicketsEntered: counter.attendeeNumber,
        totalTicketsPurchased: counter.totalTicketNumber
      }
    }
  }
  async deleteEvent(eventId: string): Promise<ApiResponse<{id: string}>> {
    const deleteId = await this.eventRepo.delete({ id: eventId});
    return {
      message: 'delete event success',
      data: {
        id: deleteId
      }
    }
  }
}
