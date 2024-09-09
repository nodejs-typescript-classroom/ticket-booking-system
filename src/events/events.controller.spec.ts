import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto, GetEventsDto, UpdateEventDto } from './dto/event.dto';
import { PageInfoRequestDto } from '../pagination.dto';


describe('EventsController', () => {
  const mockEventsService = {
    createEvent: jest.fn().mockResolvedValue({}),
    getEvent: jest.fn().mockResolvedValue({}),
    getEvents: jest.fn().mockResolvedValue({}),
    updateEvent: jest.fn().mockResolvedValue({}),
    deleteEvent: jest.fn().mockResolvedValue({})
  }
  let controller: EventsController;
  let service: EventsService;
  afterEach(() => {
    jest.clearAllMocks();
  })
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{
        provide: EventsService,
        useValue: mockEventsService,
      }]
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  /**
  given given a valid create event dto
  {
    "name": '江蕙演唱會',
    "location": '台北大巨蛋',
    "startDate": new Date(),
    "numberOfDays": 1, 
  }
   */
  it('service.createEvent should be called once with given create event dto', async () => {
    const createEventDto = new CreateEventDto();
    createEventDto.name = '江蕙演唱會';
    createEventDto.location = '台北大巨蛋';
    const startDate = new Date(Date.now() + 86400);
    createEventDto.startDate = startDate;
    await controller.createEvent(createEventDto);
    expect(service.createEvent).toHaveBeenCalledTimes(1);
    expect(service.createEvent).toHaveBeenCalledWith(createEventDto);
  });
  /**
  given a existed event id in uuid format
   */
  it('service.getEvent should be called once', async() => {
    const eventId = crypto.randomUUID();
    await controller.getEvent(eventId);
    expect(service.getEvent).toHaveBeenCalledTimes(1)
    expect(service.getEvent).toHaveBeenCalledWith({ id: eventId});
  });
  /**
  given a existed event dto
   */
  it('service.getEvents should be called once', async () => {
    const criteria = new GetEventsDto();
    const pageInfo = new PageInfoRequestDto();
    criteria.location = '台北大巨蛋';
    criteria.startDate = new Date();
    await controller.getEvents(criteria, pageInfo);
    expect(service.getEvents).toHaveBeenCalledTimes(1);
    expect(service.getEvents).toHaveBeenCalledWith(criteria, pageInfo);
  });
  /**
  given a existed event id 
  update with specific location
   */
  it('service.updateEvent should be called once', async () => {
    const eventId = crypto.randomUUID();
    const updateEventData = new UpdateEventDto();
    updateEventData.location = '台北小巨蛋';
    updateEventData.startDate = new Date(Date.now() + 86400*2);
    await controller.updateEvent(eventId, updateEventData);
    expect(service.updateEvent).toHaveBeenCalledTimes(1);
    expect(service.updateEvent).toHaveBeenCalledWith(eventId, updateEventData);
  });
  /**
  given a existed event id
   */
  it('service.deleteEvent should be called once', async () => {
    const eventId = crypto.randomUUID();
    await controller.deleteEvent(eventId);
    expect(service.deleteEvent).toHaveBeenCalledTimes(1);
    expect(service.deleteEvent).toHaveBeenCalledWith(eventId);
  });
});
