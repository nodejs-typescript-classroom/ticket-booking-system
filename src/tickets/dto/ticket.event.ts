import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateTicketEvent {
  @IsUUID()
  eventId: string;
  @IsPositive()
  @IsNumber()
  ticketNumber: number; 
}

export class VerifyTicketEvent {
  @IsUUID()
  eventId: string;
  @IsPositive()
  @IsNumber()
  ticketNumber: number;
}

export class CreateCounterEvent {
  @IsUUID()
  eventId: string;
}