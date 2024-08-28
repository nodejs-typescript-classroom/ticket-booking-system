import { IsJWT } from "class-validator";

export class LoginResponseDto {
  @IsJWT()
  access_token: string;
  @IsJWT()
  refresh_token: string;
}