import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TicketEntity } from '../schema/ticket.entity';
import { Pagination } from '../../pagination.dto';


export class CreateTicketDto {
  @IsUUID()
  eventId: string;
  @IsUUID()
  userId: string;
  @IsNumber()
  @IsPositive()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    const notANumber = isNaN(value);
    if (notANumber) {
      throw new BadRequestException({
        message: `ticketNumber should be a integer`,
        value: value,
      });
    }
    try {
      const result = parseInt(value);
      return result;
    } catch (error) {
      throw new BadRequestException({
        message: `ticketNumber should be a integer`,
        value: value,
      });    
    }
  })
  ticketNumber?: number = 1;
}
export class GetTicketDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
export class GetTicketsDto {
  @IsUUID()
  @IsOptional()
  eventId?: string;
  @IsUUID()
  @IsOptional()
  userId?: string;
}
export class VerifyTicketDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
export class TicketResponse {
  @ValidateNested()
  @Type(() => TicketEntity)
  ticket: TicketEntity;
  @IsString()
  qrcode?: string;
}
export class VerifyResponse {
  @ValidateNested()
  @Type(() => TicketEntity)
  ticket: TicketEntity;
}
export class TicketsResponse {
  @ValidateNested({ each: true})
  @Type(() => TicketEntity)
  tickets: TicketEntity[];
  @ValidateNested()
  @Type(() => Pagination)
  pageInfo: Pagination;
}
export class TicketCountDto {
  @IsUUID()
  eventId: string;
}
export class TicketsCountResponseDto {
  @IsUUID()
  eventId: string;
  @IsNumber()
  accumTickets: number;
  @IsNumber()
  accumAttendee: number;
}

export class InitialCounterDto {
  @IsUUID()
  eventId: string;
}

export class IncreaseTicketDto {
  @IsUUID()
  eventId: string;
  @IsPositive()
  @IsNumber()
  ticketNumber: number;
}

export class IncreaseAttendeeDto {
  @IsUUID()
  eventId: string;
  @IsPositive()
  @IsNumber()
  ticketNumber: number;
}