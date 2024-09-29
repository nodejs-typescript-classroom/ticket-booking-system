import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { CreateEventDto, GetEventsDto } from './dto/event.dto';
import { isUUID } from 'class-validator';
import { EventStore } from '../../mocked/event.store';
import { NotFoundException } from '@nestjs/common';
import { EventDbStore } from './event-db.store';
import { PageInfoRequestDto } from '../pagination.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventCounterRedisStore } from '../tickets/event-couter.redis.store';
import { EventCounterStore } from '../../mocked/event-counter.store';
const mockedEventEmitter = {
  emit: jest.fn().mockReturnValue({})
}
describe('EventsService', () => {
  let service: EventsService;
  let eventId: string;
  let eventEmitter: EventEmitter2;
  let eventCounterStore: EventCounterRedisStore;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, {
        provide: EventDbStore,
        useClass: EventStore,
      }, {
        provide: EventEmitter2,
        useValue: mockedEventEmitter,
      }, {
        provide: EventCounterRedisStore,
        useClass: EventCounterStore,
      }
    ]}).compile();
    service = module.get<EventsService>(EventsService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    eventCounterStore = module.get<EventCounterRedisStore>(EventCounterRedisStore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  /**
  given a valid create event dto
  {
    "name": '江蕙演唱會',
    "location": '台北大巨蛋',
    "startDate": new Date(),
    "numberOfDays": 1, 
  }
  ===>
  {
    "id": uuid format string
  }  
   */
  it('should return created uuid', async ()=> {
    const createEventDto = new CreateEventDto();
    createEventDto.name = '江蕙演唱會';
    createEventDto.location = '台北大巨蛋';
    const startDate = new Date(Date.now() + 86400);
    createEventDto.startDate = startDate;
    const result = await service.createEvent(createEventDto);
    expect(result.data).toHaveProperty('id');
    expect(isUUID(result.data.id)).toBeTruthy();
    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith("create-counter-event",{ eventId: result.data.id });
    eventId = result.data.id;
    eventCounterStore.ticketIncr(eventId, 0, 0, 0);
  });
  it('should return result event with given event id', async () => {
    const eventInfo = {
      id: eventId
    };
    const expectName = '江蕙演唱會';
    const expectLocation = '台北大巨蛋';
    const result = await service.getEvent(eventInfo);
    expect(result.data).toHaveProperty('name', expectName);
    expect(result.data).toHaveProperty('location', expectLocation);
    expect(result.data).toHaveProperty('totalTicketsPurchased', 0);
    expect(result.data).toHaveProperty('totalTicketsEntered', 0);
  });
  /**
  given a valid create event dto
  {
    "location": '台北大巨蛋'
    "startDate": new Date() 
  } 
   */
  it('shoud return result event with given location', async () => {
    // inserted
    const createEventDto = new CreateEventDto();
    createEventDto.name = '周蕙演唱會';
    createEventDto.location = '台北大巨蛋';
    const startDate = new Date(Date.now() + 86400);
    createEventDto.startDate = startDate;
    const sample = await service.createEvent(createEventDto);
    const criteria = new GetEventsDto();
    criteria.location = '台北大巨蛋';
    criteria.startDate = new Date();
    const pageInfo = new PageInfoRequestDto();
    eventCounterStore.ticketIncr(sample.data.id, 0, 0, 0);
    const result = await service.getEvents(criteria, pageInfo);
    expect(result.data).toHaveProperty('pageInfo');
    expect(result.data).toHaveProperty('events');
    expect((result.data.events).length).toEqual(2);
  });
  /**
  given a update a event dto and event id
  {
    location: '台北小巨蛋',
    startDate: new Date()
  }
   */
  it('should return updated event', async () => {
    const updateData = {
      location: '台北小巨蛋',
      startDate: new Date()
    };
    await service.updateEvent(eventId, updateData);
    const result = await service.getEvent({id: eventId});
    expect(result.data.location).toEqual(updateData.location);    
  });
  /**
  given a existed event id
   */
  it('should return deleted event id', async () => {
    const result = await service.deleteEvent(eventId);
    expect(isUUID(result.data.id)).toBeTruthy();
    await expect(service.getEvent({id: result.data.id})).rejects.toThrow(NotFoundException)
  })
});
