import { EventCounterEntity } from "./schema/event-counter.entity";

export abstract class EventCounterRespository {
  abstract get(eventId: string): Promise<EventCounterEntity>;
  abstract verifyIncr(eventId: string, ticketNumber: number, accumAttendee: number, accumTicket: number): Promise<EventCounterEntity>;
  abstract ticketIncr(eventId: string, ticketNumber: number, accumAttendee: number, accumTicket: number): Promise<EventCounterEntity>
}