import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, IsUUID } from 'class-validator';


export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

export class CreateUserResponse {
  @IsUUID()
  id: string;
}