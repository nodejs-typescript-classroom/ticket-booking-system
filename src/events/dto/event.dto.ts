import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { isISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { EventEntity } from '../schema/event.entity';

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
export class PageInfoRequestDto {
  @Min(0)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    const notANumber = isNaN(value);
    if (notANumber) {
      throw new BadRequestException({
        message: `offset should be a integer`,
        value: value,
      });
    }
    try {
      const result = parseInt(value);
      return result;
    } catch (error) {
      throw new BadRequestException({
        message: `offset should be a integer`,
        value: value,
      });    
    }
  })
  offset: number = 0;
  @IsPositive()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    const notANumber = isNaN(value);
    if (notANumber) {
      throw new BadRequestException({
        message: `offset should be a integer`,
        value: value,
      });
    }
    try {
      const result = parseInt(value);
      return result;
    } catch (error) {
      throw new BadRequestException({
        message: `offset should be a integer`,
        value: value,
      });    
    }
  })
  limit: number = 20;  
}
export class Pagination {
  @IsPositive()
  @IsNumber()
  offset: number
  @IsPositive()
  @IsNumber()
  limit: number;
  @IsPositive()
  @IsNumber()
  total: number;
}
export class EventsResponse {
  @ValidateNested({ each: true})
  @Type(() => EventEntity)
  events: EventEntity[];
  @ValidateNested()
  @Type(() => Pagination)
  pageInfo: Pagination;
} 