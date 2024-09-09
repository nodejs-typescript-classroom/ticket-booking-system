import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IncreaseAttendeeDto, IncreaseTicketDto, InitialCounterDto } from './dto/ticket.dto';
import { EventCounterStore } from './event-counter.store';
import { EventCounterRespository } from './event-counter.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateCounterEvent, CreateTicketEvent, VerifyTicketEvent } from './dto/ticket.event';

@Injectable()
export class EventsCounterService {
  constructor(
    @Inject(EventCounterStore)
    private readonly eventCounterRepo: EventCounterRespository,
  ) {}
  async initCounter(initRequestDto: InitialCounterDto) {
    const result = await this.eventCounterRepo.ticketIncr(initRequestDto.eventId,0,0,0);
    return result;
  }
  async increaseTicketCount(increaseTicketRequestDto: IncreaseTicketDto) {
    let result;
    try {
      const currentResult = await this.eventCounterRepo.get(increaseTicketRequestDto.eventId);
      result = await this.eventCounterRepo.ticketIncr(increaseTicketRequestDto.eventId, increaseTicketRequestDto.ticketNumber, currentResult.attendeeNumber, currentResult.totalTicketNumber);
    } catch(error) {
      result = await this.eventCounterRepo.ticketIncr(increaseTicketRequestDto.eventId, increaseTicketRequestDto.ticketNumber, 0, 0);
    }
    return result;
  }
  async increaseAttendeeCount(increaseAttendeeRequestDto: IncreaseAttendeeDto) {
    const currentResult = await this.eventCounterRepo.get(increaseAttendeeRequestDto.eventId);
    if (currentResult.totalTicketNumber < currentResult.attendeeNumber + increaseAttendeeRequestDto.ticketNumber) {
      throw new BadRequestException(`increase attendee number should not large than total ticket number`);
    }
    const result = await this.eventCounterRepo.verifyIncr(increaseAttendeeRequestDto.eventId, increaseAttendeeRequestDto.ticketNumber, currentResult.attendeeNumber, currentResult.totalTicketNumber);
    return result;
  }

  @OnEvent('create-counter-event')
  async handleCreateCounter(payload: CreateCounterEvent) {
    await this.initCounter(payload);
  }
  @OnEvent('create-ticket-event')
  async handleCreateTicket(payload: CreateTicketEvent) {
    await this.increaseTicketCount(payload);
  }
  @OnEvent('verify-ticket-event')
  async handleVerifyTicket(payload: VerifyTicketEvent) {
    await this.increaseAttendeeCount(payload);
  }
}
