import { IsDate, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Role } from './role.type';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users', { schema: 'public' })
export class UserEntity {
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
    name: 'email'
  })
  @IsEmail()
  email: string;
  @Column({
    type: 'varchar',
    length: '500',
    name: 'password'
  })
  @Exclude({ toPlainOnly: true, toClassOnly: true })
  @IsString()
  password: string;
  @Column({
    type: 'varchar',
    length: '500',
    name: 'refresh_token',
    default: null,
  })
  @IsString()
  @IsOptional()
  @Exclude({ toPlainOnly: true, toClassOnly: true })
  refreshToken?: string;
  @Column({
    type: 'varchar',
    length: '60',
    name: 'role',
    default: () => "'attendee'"
  })
  @IsString()
  role: Role = 'attendee';
  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
    default: 'now()',
  })
  @IsDate()
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
    default: 'now()',
  })
  @IsDate()
  updatedAt: Date;
}