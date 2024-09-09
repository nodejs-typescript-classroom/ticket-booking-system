import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto, EventsResponse } from './dto/event.dto';
import { EventsRepository } from './events.repository';
import { EventEntity } from './schema/event.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageInfoRequestDto } from '../pagination.dto';
@Injectable()
export class EventDbStore implements EventsRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>
  ) {}
  async save(eventInfo: CreateEventDto): Promise<EventEntity> {
    const event = new EventEntity();
    event.id = crypto.randomUUID();
    event.name = eventInfo.name;
    event.location = eventInfo.location;
    event.startDate = eventInfo.startDate;
    if (eventInfo.numberOfDays) {
      event.numberOfDays = eventInfo.numberOfDays;
    }
    await this.eventRepo.save(event);
    return event;
  }
  async findOne(criteria: Partial<EventEntity>): Promise<EventEntity> {
    const event = await this.eventRepo.findOneBy(criteria);
    if (!event) {
      throw new NotFoundException('event not found');
    }
    return event;
  }
  async find(criteria: Partial<EventEntity>, pageInfo: PageInfoRequestDto): Promise<EventsResponse> {
    let queryBuilder = this.eventRepo.createQueryBuilder('events');
    const offset = pageInfo.offset;
    const limit = pageInfo.limit;
    let whereCount = 0;
    if (criteria.location) {
      queryBuilder = (whereCount == 0)? 
      queryBuilder.where('events.location = :location', { location: criteria.location})
      :queryBuilder.andWhere('events.location = :location', { location: criteria.location});
      whereCount++;
    }
    if (criteria.name) {
      queryBuilder = (whereCount == 0)? 
      queryBuilder.where('events.name = :name',{name: criteria.name})
      :queryBuilder.andWhere('events.name = :name',{name: criteria.name});
      whereCount++;
    }
    if (criteria.startDate) {
      queryBuilder = (whereCount == 0)?
      queryBuilder.where('events.start_date = :startDate', {startDate: criteria.startDate})
      :queryBuilder.andWhere('events.start_date = :startDate', {startDate: criteria.startDate});
      whereCount++;
    }
    queryBuilder = queryBuilder.offset(offset);
    queryBuilder = queryBuilder.limit(limit);
    queryBuilder = queryBuilder.orderBy('start_date', 'ASC');
    const [events, total] = await queryBuilder.getManyAndCount();
    return {
      events,
      pageInfo: {
        total: total,
        offset: pageInfo.offset,
        limit: pageInfo.limit,
      }
    }
  }
  async update(criteria: Partial<EventEntity>, data: Partial<EventEntity>): Promise<EventEntity> {
    const queryBuilder = this.eventRepo.createQueryBuilder('events');
    const result = await queryBuilder.update<EventEntity>(EventEntity, data)
    .where(criteria).returning(['id', 'name', 'location', 'startDate', 'numberOfDays', 'createdAt', 'updatedAt']).updateEntity(true).execute();
    const model: EventEntity = result.raw[0] as EventEntity;
    return model;
  }
  async delete(criteria: Partial<EventEntity>): Promise<string> {
    const queryBuilder = this.eventRepo.createQueryBuilder('events');
    const result = await queryBuilder.delete().where(criteria).execute();
    if (result.affected == 0) {
      throw new NotFoundException('delete target not found');
    }
    return criteria.id;
  }

}