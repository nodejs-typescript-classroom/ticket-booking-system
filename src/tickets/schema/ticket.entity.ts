import { IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('tickets', { schema: 'public' })
export class TicketEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id'
  })
  @IsUUID()
  id: string;
  @Column({
    type: 'uuid',
    name: 'event_id',
    nullable: false,
  })
  @IsUUID()
  eventId: string;
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: false
  })
  @IsUUID()
  userId: string;
  @Column({
    type: 'boolean',
    name: 'entered',
    default: false,
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  entered?: boolean = false;
  @Column({
    type: 'bigint',
    name: 'ticket_number',
    default: 1,
    nullable: false,
  })
  @IsPositive()
  @IsNumber()
  @IsOptional()
  ticketNumber?: number = 1;
  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
    nullable: false,
    default: 'now()',
  })
  @IsDate()
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
    nullable: false,
    default: 'now()',
  })
  @IsDate()
  updatedAt: Date;
}