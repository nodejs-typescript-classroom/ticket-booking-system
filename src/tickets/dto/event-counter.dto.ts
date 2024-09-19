import { IsNumber, IsUUID } from 'class-validator';

export class EventCounterDto {
  @IsUUID()
  eventId: string = '';
  @IsNumber()
  accumTotal: number = 0;
  @IsNumber()
  accumJoin: number = 0;
  @IsNumber()
  requestTotal: number = 0;
  @IsNumber()
  requestJoin: number = 0;
}

export class EventCounterResponse {
  @IsNumber()
  accumTotal: number;
  @IsNumber()
  accumJoin: number;  
}