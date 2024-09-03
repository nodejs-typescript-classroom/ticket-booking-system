import { IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class EventEntity {
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
  numberOfDays: number = 1;
}