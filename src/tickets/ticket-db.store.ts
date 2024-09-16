import { PageInfoRequestDto } from 'src/pagination.dto';
import { CreateTicketDto, TicketsResponse, TicketsCountResponseDto } from './dto/ticket.dto';
import { TicketEntity } from './schema/ticket.entity';
import { TicketsRepository } from './tickets.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketDbStore implements TicketsRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
  ) {}
  async save(ticketInfo: CreateTicketDto): Promise<TicketEntity> {
    const ticket = new TicketEntity();
    ticket.id = crypto.randomUUID();
    ticket.userId = ticketInfo.userId;
    ticket.eventId = ticketInfo.eventId;
    if (ticketInfo.ticketNumber) {
      ticket.ticketNumber = ticketInfo.ticketNumber;
    }
    await this.ticketRepo.save(ticket);
    return ticket;
  }
  async findOne(criteria: Partial<TicketEntity>): Promise<TicketEntity> {
    const ticket = await this.ticketRepo.findOneBy(criteria);
    if (!ticket) {
      throw new NotFoundException('ticket not found');
    }
    return ticket;
  }
  async find(criteria: Partial<TicketEntity>, pageInfo: PageInfoRequestDto): Promise<TicketsResponse> {
    let queryBuilder = this.ticketRepo.createQueryBuilder('tickets');
    const offset = pageInfo.offset;
    const limit = pageInfo.limit;
    let whereCount = 0;
    if (criteria.userId) {
      queryBuilder = (whereCount == 0)?
      queryBuilder.where('tickets.user_id = :userId', { userId: criteria.userId }):
      queryBuilder.andWhere('tickets.user_id = :userId', { userId: criteria.userId })
      whereCount++;
    }
    if (criteria.eventId) {
      queryBuilder = (whereCount == 0)?
      queryBuilder.where('tickets.event_id = : eventId', { eventId: criteria.eventId }):
      queryBuilder.andWhere('tickets.event_id = : eventId', { eventId: criteria.eventId });
      whereCount++;
    }
    queryBuilder = queryBuilder.offset(offset);
    queryBuilder = queryBuilder.limit(limit);
    const [tickets, total] = await queryBuilder.getManyAndCount();
    return {
      tickets,
      pageInfo: {
        total: total,
        offset: pageInfo.offset,
        limit: pageInfo.limit
      }
    }
  }
  async update(criteria: Partial<TicketEntity>, data: Partial<TicketEntity>): Promise<TicketEntity> {
    const queryBuilder = this.ticketRepo.createQueryBuilder('tickets');
    const result = await queryBuilder.update<TicketEntity>(TicketEntity, data)
    .where(criteria).returning(['id', 'eventId', 'userId', 'entered', 'ticketNumber', 'createdAt', 'updatedAt'])
    .updateEntity(true).execute();
    const model: TicketEntity = new TicketEntity();
    model.id = result.raw[0]['id'];
    model.eventId = result.raw[0]['event_id'];
    model.userId = result.raw[0]['user_id'];
    model.entered = result.raw[0]['entered'];
    model.createdAt = new Date(result.raw[0]['created_at']);
    model.updatedAt = new Date(result.raw[0]['updated_at']);
    return model; 
  }
  async getCounts(criteria: Partial<TicketEntity>): Promise<TicketsCountResponseDto> {
    const queryManager = this.dataSource.manager;
    const [totalResult, attendeeResult] = await Promise.all([
      queryManager.query<{total: number}>('SELECT COUNT(ticket_number) AS total FROM public.tickets where event_id=?', [criteria.eventId]),
      queryManager.query<{total: number}>('SELECT COUNT(ticket_number) AS total FROM public.tickets where event_id=? and entered=false', [criteria.eventId]),
    ]);
    const accumTickets = totalResult.total;
    const accumAttendee = attendeeResult.total;
    return {
      eventId: criteria.eventId,
      accumTickets: accumTickets,
      accumAttendee: accumAttendee
    }   
  }

}