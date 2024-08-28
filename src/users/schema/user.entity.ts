import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from './role.type';

export class UserEntity {
  @IsUUID()
  id: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  @IsOptional()
  refreshToken?: string;
  @IsString()
  role: Role = 'attendee';
}