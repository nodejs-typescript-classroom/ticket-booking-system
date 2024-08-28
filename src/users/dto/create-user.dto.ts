import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { Role } from '../schema/role.type';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
  @IsString()
  @IsOptional()
  role?: Role;
}