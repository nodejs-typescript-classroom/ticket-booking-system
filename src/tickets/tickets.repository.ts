import { PageInfoRequestDto } from '../pagination.dto';
import { CreateTicketDto, TicketsCountResponseDto, TicketsResponse } from './dto/ticket.dto';
import { TicketEntity } from './schema/ticket.entity';

export abstract class TicketsRepository {
  abstract save(ticketInfo: CreateTicketDto): Promise<TicketEntity>;
  abstract findOne(criteria: Partial<TicketEntity>): Promise<TicketEntity>;
  abstract find(criteria: Partial<TicketEntity>, pageInfo: PageInfoRequestDto): Promise<TicketsResponse>;
  abstract update(criteria: Partial<TicketEntity>, data: Partial<TicketEntity>): Promise<TicketEntity>;
  abstract getCounts(criteria: Partial<TicketEntity>): Promise<TicketsCountResponseDto>;
}