import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/ticket.dto';
import { isUUID } from 'class-validator';
import { TicketsStore } from '../../mocked/tickets.store';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PageInfoRequestDto } from '../pagination.dto';
import { TicketDbStore } from './ticket-db.store';

const mockedEventEmitter = {
  emit: jest.fn().mockReturnValue({})
}
describe('TicketsService', () => {
  let service: TicketsService;
  let emitter: EventEmitter2;
  let ticketId: string;
  let userId: string;
  let eventId: string;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsService, {
        provide: TicketDbStore,
        useClass: TicketsStore,
      }, {
        provide: EventEmitter2,
        useValue: mockedEventEmitter
      }],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    emitter = module.get<EventEmitter2>(EventEmitter2);
  });
  afterEach(() => {
    jest.clearAllMocks();
  })
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  /**
  given a event id and userid with request ticketNumber 
  {
    eventId: uuid,
    userId: uuid,
    ticketNumber: 1,
  }
   */
  it('should return a created ticketId, and create ticket event should be sent', async () => {
    const createTicketInfo = new CreateTicketDto();
    createTicketInfo.userId = crypto.randomUUID();
    createTicketInfo.eventId = crypto.randomUUID();
    createTicketInfo.ticketNumber = 1;
    const result = await service.createTicket(createTicketInfo);
    expect(result.data).toHaveProperty('id');
    ticketId = result.data.id;
    userId = createTicketInfo.userId;
    eventId = createTicketInfo.eventId;
    expect(isUUID(result.data.id)).toBeTruthy();
    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenCalledWith('create-ticket-event', 
      { eventId: createTicketInfo.eventId, ticketNumber: createTicketInfo.ticketNumber});
  });
  /**
  given existed id
   */
  it('should return ticketInfo with specific ticketid', async () => {
    const result = await service.getTicket({id: ticketId }, userId);
    expect(result.data.ticket).toHaveProperty('userId', userId);
    expect(result.data.ticket).toHaveProperty('eventId', eventId);
    expect(result.data.ticket).toHaveProperty('ticketNumber', 1);
  });
  /**
  given not existed id
   */
  it('should reject with NotFound Exception', async () => {
    await expect(service.getTicket({ id: crypto.randomUUID()}, userId)).rejects.toThrow(NotFoundException);
  })
  /**
  given exist event id
   */
  it('should return response data with specific event id', async () => {
    const pageInfo = new PageInfoRequestDto();
    const result = await service.getTickets({ eventId: eventId }, pageInfo);
    expect(result.data).toHaveProperty('tickets');
    expect(result.data).toHaveProperty('pageInfo');
    expect(result.data.pageInfo).toHaveProperty('total', 1);
  });
  /**
  given exist not verified ticket id
   */
  it('should return verified uuid ticket and generate verify ticket event', async () => {
    const result = await service.verifyTicket({ id: ticketId });
    expect(result.data.ticket).toHaveProperty('id', ticketId);
    expect(emitter.emit).toHaveBeenCalledTimes(1)
    expect(emitter.emit).toHaveBeenCalledWith('verify-ticket-event', {
      eventId: eventId,
      ticketNumber: 1
    });
  });
  /**
  given verified ticket id
   */
  it('should reject with BadRequestException', async() => {
    await expect(service.verifyTicket({ id: ticketId })).rejects.toThrow(BadRequestException);
    expect(emitter.emit).toHaveBeenCalledTimes(0);
  });
  /**
  given existed event id
   */
  it('should retrive count of attendee and tickets', async() => {
    const result = await service.getCount({ eventId: eventId });
    expect(result).toHaveProperty('accumTickets', 1);
    expect(result).toHaveProperty('accumAttendee', 1)
  });
});
