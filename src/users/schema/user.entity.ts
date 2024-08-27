import { IsEmail, IsString, IsUUID } from 'class-validator';

export class UserEntity {
  @IsUUID()
  id: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}