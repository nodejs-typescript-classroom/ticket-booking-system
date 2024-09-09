import { IsNumber, IsUUID, Min } from 'class-validator';

export class EventCounterEntity {
  @IsUUID()
  eventId: string;
  @Min(0)
  @IsNumber()
  totalTicketNumber: number;
  @Min(0)
  @IsNumber()
  attendeeNumber: number;
}