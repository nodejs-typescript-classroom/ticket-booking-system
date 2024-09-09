import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { CreateTicketDto, GetTicketsDto, VerifyTicketDto } from './dto/ticket.dto';
import { TicketsService } from './tickets.service';
import { PageInfoRequestDto } from '../pagination.dto';

describe('TicketsController', () => {
  const mockTicketService = {
    createTicket: jest.fn().mockResolvedValue({}),
    getTicket: jest.fn().mockResolvedValue({}),
    getTickets: jest.fn().mockResolvedValue({}),
    verifyTicket: jest.fn().mockResolvedValue({}),
  }
  let controller: TicketsController;
  let service: TicketsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [{
        provide: TicketsService,
        useValue: mockTicketService,
      }]
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  /**
  given a event id and userid with request ticketNumber 
  {
    eventId: uuid,
    userId: uuid,
    ticketNumber: 1,
  }
   */
  it('service.createTicket should be called once', async () => {
    const createTicketInfo = new CreateTicketDto();
    createTicketInfo.eventId = crypto.randomUUID();
    createTicketInfo.userId = crypto.randomUUID();
    createTicketInfo.ticketNumber = 1;
    await controller.createTicket(createTicketInfo);
    expect(service.createTicket).toHaveBeenCalledTimes(1);
    expect(service.createTicket).toHaveBeenCalledWith(createTicketInfo);
  });
  /**
  given a exist ticket id
   */
  it('service.getTicket should be called once', async () => {
    const id = crypto.randomUUID();
    await controller.getTicket(id);
    expect(service.getTicket).toHaveBeenCalledTimes(1);
    expect(service.getTicket).toHaveBeenCalledWith({ id });
  });
  /**
  givne a exist user id
   */
  it('service.getTickets should be called once', async () => {
    const getTicketsDto = new GetTicketsDto();
    getTicketsDto.userId = crypto.randomUUID();
    const pageInfo = new PageInfoRequestDto();
    await controller.getTickets(getTicketsDto, pageInfo);
    expect(service.getTickets).toHaveBeenCalledTimes(1);
    expect(service.getTickets).toHaveBeenCalledWith(getTicketsDto, pageInfo);
  });
  /**
  given a non-verify ticket id, with user
   */
  it('service.verifyTicket should be called once', async () => {
    const verifyTicketInfo = new VerifyTicketDto();
    verifyTicketInfo.id = crypto.randomUUID();
    await controller.verifyTicket(verifyTicketInfo);
    expect(service.verifyTicket).toHaveBeenCalledTimes(1);
    expect(service.verifyTicket).toHaveBeenCalledWith(verifyTicketInfo);
  });
});
