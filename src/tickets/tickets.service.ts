import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTicketDto, GetTicketDto, GetTicketsDto, TicketCountDto, VerifyTicketDto } from './dto/ticket.dto';
import { TicketsRepository } from './tickets.repository';
import { TicketsStore } from './tickets.store';
import { CreateTicketEvent, VerifyTicketEvent } from './dto/ticket.event';
import { PageInfoRequestDto } from '../pagination.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly eventEmitter: EventEmitter2, 
    @Inject(TicketsStore)
    private readonly ticketRepo: TicketsRepository, 
  ) {}
  async createTicket(ticketInfo: CreateTicketDto) {
    const result = await this.ticketRepo.save(ticketInfo);
    const createTicketEvent = new CreateTicketEvent();
    createTicketEvent.eventId = result.eventId;
    createTicketEvent.ticketNumber = result.ticketNumber;
    this.eventEmitter.emit('create-ticket-event', createTicketEvent);
    return {
      id: result.id
    }
  }
  async getTicket(ticketInfo: GetTicketDto) {
    return await this.ticketRepo.findOne(ticketInfo);
  }
  async getTickets(ticketsInfo: GetTicketsDto, pageInfo: PageInfoRequestDto) {
    return await this.ticketRepo.find(ticketsInfo, pageInfo);
  }
  async verifyTicket(ticketInfo: VerifyTicketDto) {
    const updateTicket = await this.ticketRepo.findOne(ticketInfo);
    if (updateTicket.entered == true) {
      throw new BadRequestException(`ticket has been verified`);
    }
    const updatedTicket = await this.ticketRepo.update(ticketInfo, { entered: true });
    const verifyTicketEvent = new VerifyTicketEvent();
    verifyTicketEvent.eventId = updatedTicket.eventId;
    verifyTicketEvent.ticketNumber = updatedTicket.ticketNumber;
    this.eventEmitter.emit('verify-ticket-event', verifyTicketEvent);
    return updatedTicket;
  }
  async getCount(ticketInfo: TicketCountDto) {
    return this.ticketRepo.getCounts(ticketInfo);
  }
}
