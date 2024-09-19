import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EventCounterRespository } from './event-counter.repository';
import { EventCounterEntity } from './schema/event-counter.entity';
import { RedisService } from './redis.service';
@Injectable()
export class EventCounterRedisStore implements EventCounterRespository {
  constructor(
    private readonly redisService: RedisService
  ) {}
  async get(eventId: string): Promise<EventCounterEntity> {
    try {
      const hasKey = await this.redisService.hasKey(eventId);
      if (!hasKey) {
        throw new NotFoundException({
          message: 'event id not initial or not existed', eventId });
      }
      return this.redisService.getCount(eventId);
    } catch (err: unknown) {
      const error: Error = err as Error;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'event counter get error',
        error: error,
        type: 'COUNTER_GET_ERROR'
      })
    }
  }
  async verifyIncr(eventId: string, ticketNumber: number, accumAttendee: number, accumTicket: number): Promise<EventCounterEntity> {
    const resultCounter = new EventCounterEntity();
    resultCounter.eventId = eventId;
    const result = await this.redisService.executeLuaScript({
      eventId: eventId,
      requestJoin: ticketNumber,
      requestTotal:0,
      accumTotal: accumTicket,
      accumJoin: accumAttendee,
    });
    resultCounter.attendeeNumber = result.join;
    resultCounter.totalTicketNumber = result.total;
    return resultCounter;
  }
  async ticketIncr(eventId: string, ticketNumber: number, accumAttendee: number, accumTicket: number): Promise<EventCounterEntity> {
    const resultCounter = new EventCounterEntity();
    resultCounter.eventId = eventId;
    const result = await this.redisService.executeLuaScript({
      eventId: eventId,
      requestJoin: 0,
      requestTotal: ticketNumber,
      accumTotal: accumTicket,
      accumJoin: accumAttendee,
    });
    resultCounter.attendeeNumber = result.join;
    resultCounter.totalTicketNumber = result.total;
    return resultCounter;
  }
}