import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTicketDto, GetTicketDto, GetTicketsDto, TicketCountDto, TicketResponse, TicketsResponse, VerifyResponse, VerifyTicketDto } from './dto/ticket.dto';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketEvent, VerifyTicketEvent } from './dto/ticket.event';
import { PageInfoRequestDto } from '../pagination.dto';
import { TicketDbStore } from './ticket-db.store';
import * as QrCode from 'qrcode';
import { ApiResponse } from '../api-response.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly eventEmitter: EventEmitter2, 
    @Inject(TicketDbStore)
    private readonly ticketRepo: TicketsRepository, 
  ) {}
  async createTicket(ticketInfo: CreateTicketDto):Promise<ApiResponse<{id: string}>> {
    const result = await this.ticketRepo.save(ticketInfo);
    const createTicketEvent = new CreateTicketEvent();
    createTicketEvent.eventId = result.eventId;
    createTicketEvent.ticketNumber = parseInt(result.ticketNumber.toString());
    this.eventEmitter.emit('create-ticket-event', createTicketEvent);
    return {
      message: 'buy ticket success',
      data: {
        id: result.id
      }
    }
  }
  async getTicket(ticketInfo: GetTicketDto, userId: string): Promise<ApiResponse<TicketResponse>> {
    const ticket =  await this.ticketRepo.findOne(ticketInfo);
    const jsonString = JSON.stringify({ ticket_id: ticket.id, user_id: userId});
    const promiseQrCode = new Promise<string>((resolve, reject) => {
      QrCode.toBuffer(jsonString, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.toString('base64'));
      });
    });
    const qrcode = await promiseQrCode;
    return {
      message: 'get ticket success',
      data: {
        ticket,
        qrcode
      }
    }
  }
  async getTickets(ticketsInfo: GetTicketsDto, pageInfo: PageInfoRequestDto): Promise<ApiResponse<TicketsResponse>> {
    const result = await this.ticketRepo.find(ticketsInfo, pageInfo);
    return {
      message: 'get tickets success',
      data: {
        tickets: result.tickets,
        pageInfo: result.pageInfo
      }
    }
  }
  async verifyTicket(ticketInfo: VerifyTicketDto): Promise<ApiResponse<VerifyResponse>> {
    const updateTicket = await this.ticketRepo.findOne(ticketInfo);
    if (updateTicket.entered == true) {
      throw new BadRequestException(`ticket has been verified`);
    }
    if (updateTicket.userId !== ticketInfo.userId) {
      throw new BadRequestException(`wrong ticket owner`);
    }
    const updatedTicket = await this.ticketRepo.update(ticketInfo, { entered: true });
    const verifyTicketEvent = new VerifyTicketEvent();
    verifyTicketEvent.eventId = updatedTicket.eventId;
    verifyTicketEvent.ticketNumber = updatedTicket.ticketNumber;
    this.eventEmitter.emit('verify-ticket-event', verifyTicketEvent);
    return {
      message: 'verify ticket success',
      data: {
        ticket: updatedTicket,
      }
    }
  }
  async getCount(ticketInfo: TicketCountDto) {
    return this.ticketRepo.getCounts(ticketInfo);
  }
}
