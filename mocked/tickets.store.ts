import { PageInfoRequestDto } from '../src/pagination.dto';
import { CreateTicketDto, TicketsCountResponseDto, TicketsResponse } from '../src/tickets/dto/ticket.dto';
import { TicketEntity } from '../src/tickets/schema/ticket.entity';
import { TicketsRepository } from '../src/tickets/tickets.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class TicketsStore implements TicketsRepository {
  tickets: TicketEntity[] = new Array<TicketEntity>();
  async save(ticketInfo: CreateTicketDto): Promise<TicketEntity> {
    const ticket = new TicketEntity();
    ticket.id = crypto.randomUUID();
    ticket.userId = ticketInfo.userId;
    ticket.eventId = ticketInfo.eventId;
    if (ticketInfo.ticketNumber) {
      ticket.ticketNumber = ticketInfo.ticketNumber;
    }
    this.tickets.push(ticket);
    return ticket;
  }
  async findOne(criteria: Partial<TicketEntity>): Promise<TicketEntity> {
    const foundIdx = this.tickets.findIndex((item) => item.id == criteria.id);
    if (foundIdx == -1) {
      throw new NotFoundException(`ticket with id: ${criteria.id} not found`);
    }
    return this.tickets[foundIdx];
  }
  async find(criteria: Partial<TicketEntity>, pageInfo: PageInfoRequestDto): Promise<TicketsResponse> {
    let filteredTicket: TicketEntity[] = this.tickets.slice(pageInfo.offset, pageInfo.offset + pageInfo.limit);
    if (criteria.eventId) {
      filteredTicket = filteredTicket.filter((item) => item.eventId == criteria.eventId);
    }
    if (criteria.userId) {
      filteredTicket = filteredTicket.filter((item) => item.userId == criteria.userId);
    }
    return {
      tickets: filteredTicket,
      pageInfo: {
        limit: pageInfo.limit,
        offset: pageInfo.offset,
        total: filteredTicket.length
      }
    }
  }
  async update(criteria: Partial<TicketEntity>, data: Partial<TicketEntity>): Promise<TicketEntity> {
    const updateIdx = this.tickets.findIndex((item) => item.id == criteria.id);
    if (updateIdx == -1) {
      throw new NotFoundException(`update target with ticketid ${criteria.id} not found`);
    }
    if (data.entered) {
      this.tickets[updateIdx].entered = data.entered;
    }
    return this.tickets[updateIdx];
  }
  async getCounts(criteria: Partial<TicketEntity>): Promise<TicketsCountResponseDto> {
    const filteredTicket = this.tickets.filter((item) => item.eventId = criteria.eventId );
    let accumAttendee = 0;
    let accumTickets = 0;
    filteredTicket.forEach((item) => {
      accumTickets += item.ticketNumber;
      if (item.entered) {
        accumAttendee += item.ticketNumber;
      }
    });
    return {
      eventId: criteria.eventId,
      accumAttendee: accumAttendee,
      accumTickets: accumTickets 
    }
  } 
}