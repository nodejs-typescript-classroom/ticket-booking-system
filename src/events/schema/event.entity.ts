import { IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryColumn, Unique, UpdateDateColumn } from 'typeorm';

@Unique('unique_event_condition', ['name', 'location', 'startDate'])
@Entity('events', { schema: 'public' })
export class EventEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id'
  })
  @IsUUID()
  id: string;
  @Column({
    unique: true,
    type: 'varchar',
    length: '200',
    name: 'name'
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @Column({
    type: 'varchar',
    length: '200',
    name: 'location',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  location: string;
  @Column({
    type: 'timestamp without time zone',
    name: 'start_date',
    nullable: false,
  })
  @IsDate()
  startDate: Date;
  @Column({
    type: 'bigint',
    name: 'number_of_days',
    nullable: false,
    default: 1,
  })
  @IsNumber()
  numberOfDays: number = 1;
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