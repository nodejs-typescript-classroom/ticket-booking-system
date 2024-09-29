import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsDate, isISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { EventEntity } from '../schema/event.entity';
import { Pagination } from '../../pagination.dto';

export class CreateEventDto {
  @IsString()
  name: string;
  @IsString()
  location: string;
  @Transform(({ value }) => {
    const isValidDate = isISO8601(value, { strict: true, strictSeparator: true });
    if (!isValidDate) {
      throw new BadRequestException(`Property "startDate" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  @IsNotEmpty()
  startDate: Date;
  @IsOptional()
  @IsNumber()
  numberOfDays?: number = 1;
}
export class GetEventDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class GetEventsDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string;
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  location?: string;
  @Transform(({ value }) => {
    const isValidDate = isISO8601(value, { strict: true, strictSeparator: true });
    if (!isValidDate) {
      throw new BadRequestException(`Property "startDate" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  @IsNotEmpty()
  @IsOptional()
  startDate: Date;
}

export class UpdateEventDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string;
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  location: string;
  @Transform(({ value }) => {
    const isValidDate = isISO8601(value, { strict: true, strictSeparator: true });
    if (!isValidDate) {
      throw new BadRequestException(`Property "startDate" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  @IsNotEmpty()
  @IsOptional()
  startDate?: Date;
}

export class EventsResponse {
  @ValidateNested({ each: true})
  @Type(() => EventEntity)
  events: EventEntity[];
  @ValidateNested()
  @Type(() => Pagination)
  pageInfo: Pagination;
} 
export class EventsResponseDto {
  @ValidateNested({ each: true})
  @Type(() => EventResponse)
  events: EventResponse[];
  @ValidateNested()
  @Type(() => Pagination)
  pageInfo: Pagination;
}
export class EventResponse {
  @IsUUID()
  id: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  location: string;
  @IsDate()
  startDate: Date;
  @IsNumber()
  numberOfDays: number;
  @IsDate()
  createdAt: Date;
  @IsDate()
  updatedAt: Date;
  @IsNumber()
  totalTicketsPurchased: number = 0;
  @IsNumber()
  totalTicketsEntered: number = 0;
}