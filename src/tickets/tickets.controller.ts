import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, GetTicketsDto, VerifyTicketDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PageInfoRequestDto } from '../pagination.dto';
import { PermissionGuard } from './guards/permission.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserEntity } from '../users/schema/user.entity';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
  ) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createTicket(createTicketDto);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async getTicket(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    return this.ticketsService.getTicket({ id: id }, user.id);
  }
  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async getTickets(@Query() getTicketsDto: GetTicketsDto, @Query() pageInfo: PageInfoRequestDto) {
    return this.ticketsService.getTickets(getTicketsDto, pageInfo);
  }
  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  async verifyTicket(@Body() verifyTicketDto: VerifyTicketDto) {
    return this.ticketsService.verifyTicket(verifyTicketDto);
  }
}
