import { CreateEventDto, EventsResponse, PageInfoRequestDto } from './dto/event.dto';
import { EventEntity } from './schema/event.entity';

export abstract class EventsRepository {
  abstract save(eventInfo: CreateEventDto): Promise<EventEntity>;
  abstract findOne(criteria: Partial<EventEntity>): Promise<EventEntity>;
  abstract find(criteria: Partial<EventEntity>, pageInfo: PageInfoRequestDto): Promise<EventsResponse>;
  abstract update(criteria: Partial<EventEntity>, data: Partial<EventEntity>): Promise<EventEntity>;
  abstract delete(criteria: Partial<EventEntity>): Promise<string>;
}