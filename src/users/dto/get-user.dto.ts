import { IsDate, IsEmail, IsJWT, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '../schema/role.type';
import { UserEntity } from '../schema/user.entity';

export class UserDto {
  @IsUUID()
  id: string;
  @IsEmail()
  email: string;
  @IsString()
  role: Role = 'attendee';
  @IsDate()
  createdAt: Date;
  @IsDate()
  updatedAt: Date;
  @IsJWT()
  @IsOptional()
  refreshToken: string;
}

export const convertEntityToDto = (user: UserEntity): UserDto => {
  const userDto = new UserDto();
  userDto.id = user.id;
  userDto.email = user.email;
  userDto.role = user.role;
  userDto.createdAt = user.createdAt;
  userDto.updatedAt = user.updatedAt;
  userDto.refreshToken = user.refreshToken;
  return userDto;
}