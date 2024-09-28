import { IsJWT, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserDto } from '../../users/dto/get-user.dto';
import { Type } from 'class-transformer';

export class LoginResponseDto {
  @IsJWT()
  access_token: string;
  @IsJWT()
  refresh_token: string;
  @ValidateNested()
  @Type(()=> UserDto)
  user: UserDto;
}
