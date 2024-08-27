import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService
  ) {}
  @Post('register')
  async register(@Body() userInfo: CreateUserDto) {
    return await this.usersService.createUser(userInfo);
  }
}
