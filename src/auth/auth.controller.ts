import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/schema/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @Post('register')
  async register(@Body() userInfo: CreateUserDto) {
    return await this.usersService.createUser(userInfo);
  }
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: UserEntity) {
    return await this.authService.login(user);
  }
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(@CurrentUser() user: UserEntity) {
    return await this.authService.login(user);
  }
}
