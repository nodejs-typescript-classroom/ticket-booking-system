import { Test, TestingModule } from '@nestjs/testing';
import { EventsCounterService } from './events-counter.service';
import { EventCounterStore } from '../../mocked/event-counter.store';
import { BadRequestException } from '@nestjs/common';
import { TicketDbStore } from './ticket-db.store';
import { TicketsStore } from '../../mocked/tickets.store';
import { EventCounterRedisStore } from './event-couter.redis.store';

describe('EventsCounterService', () => {
  let service: EventsCounterService;
  let eventId: string;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsCounterService, {
        provide: EventCounterRedisStore,
        useClass: EventCounterStore,
      }, {
        provide: TicketDbStore,
        useClass: TicketsStore
      }],
    }).compile();

    service = module.get<EventsCounterService>(EventsCounterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  /**
  init event ticket couuter
   */
  it('should initial counter with specific event id', async () => {
    eventId = crypto.randomUUID();
    const result = await service.initCounter({ eventId: eventId });
    expect(result).toHaveProperty('totalTicketNumber', 0);
    expect(result).toHaveProperty('attendeeNumber', 0);
  });
  /**
  increase ticket on specific the exist event
   */
  it('should return increase the ticket number', async () => {
    const result = await service.increaseTicketCount({ eventId: eventId, ticketNumber: 1});
    expect(result).toHaveProperty('totalTicketNumber', 1);
    expect(result).toHaveProperty('attendeeNumber', 0);    
  });
  /**
  increase attendee on specific exist event
   */
  it('should return increase the attendee number', async () => {
    const result = await service.increaseAttendeeCount({ eventId: eventId, ticketNumber: 1});
    expect(result).toHaveProperty('totalTicketNumber', 1);
    expect(result).toHaveProperty('attendeeNumber', 1);
  });
  /**
  increase over total ticket number
   */
  it('should return increase the attendee number', async () => {
    await expect(service.increaseAttendeeCount({ eventId: eventId, ticketNumber: 2})).rejects
     .toThrow(BadRequestException);
  });
});
