import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

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