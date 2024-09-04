import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { CreateEventDto, GetEventsDto, PageInfoRequestDto } from './dto/event.dto';
import { isUUID } from 'class-validator';
import { EventStore } from '../../mocked/event.store';
import { NotFoundException } from '@nestjs/common';
import { EventDbStore } from './event-db.store';

describe('EventsService', () => {
  let service: EventsService;
  let eventId: string;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, {
        provide: EventDbStore,
        useClass: EventStore,
      }],
    }).compile();

    service = module.get<EventsService>(EventsService);
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
    expect(result).toHaveProperty('id');
    expect(isUUID(result.id)).toBeTruthy();
    eventId = result.id;
  });
  it('should return result event with given event id', async () => {
    const eventInfo = {
      id: eventId
    };
    const expectName = '江蕙演唱會';
    const expectLocation = '台北大巨蛋';
    const result = await service.getEvent(eventInfo);
    expect(result).toHaveProperty('name', expectName);
    expect(result).toHaveProperty('location', expectLocation);
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
    await service.createEvent(createEventDto);
    const criteria = new GetEventsDto();
    criteria.location = '台北大巨蛋';
    criteria.startDate = new Date();
    const pageInfo = new PageInfoRequestDto();
    const result = await service.getEvents(criteria, pageInfo);
    expect(result).toHaveProperty('pageInfo');
    expect(result).toHaveProperty('events');
    expect((result.events).length).toEqual(2);
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
    expect(result.location).toEqual(updateData.location);    
  });
  /**
  given a existed event id
   */
  it('should return deleted event id', async () => {
    const result = await service.deleteEvent(eventId);
    expect(isUUID(result)).toBeTruthy();
    await expect(service.getEvent({id: result})).rejects.toThrow(NotFoundException)
  })
});
