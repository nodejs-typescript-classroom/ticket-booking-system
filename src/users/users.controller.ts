import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/role.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUser(@Param('id', ParseUUIDPipe) id: string ) {
    return this.usersService.findUser({id: id});
  }
}
