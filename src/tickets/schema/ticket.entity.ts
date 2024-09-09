import { IsBoolean, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class TicketEntity {
  @IsUUID()
  id: string;
  @IsUUID()
  eventId: string;
  @IsUUID()
  userId: string;
  @IsBoolean()
  @IsOptional()
  entered?: boolean = false;
  @IsPositive()
  @IsNumber()
  @IsOptional()
  ticketNumber?: number = 1;
}