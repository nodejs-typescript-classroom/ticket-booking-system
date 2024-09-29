import { Body, Controller, Delete, Get, Injectable, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, GetEventsDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/roles.decorator';
import { PageInfoRequestDto } from '../pagination.dto';
@Injectable()
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventService: EventsService,
  ) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventService.createEvent(createEventDto);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getEvent(@Param('id', ParseUUIDPipe) eventId: string) {
    return this.eventService.getEvent({ id: eventId});
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async getEvents(@Query() criteria: GetEventsDto, @Query() pageInfo:PageInfoRequestDto) {
    return this.eventService.getEvents(criteria, pageInfo);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  async updateEvent(@Param('id', ParseUUIDPipe) eventId: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.updateEvent(eventId, updateEventDto);
  }  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  async deleteEvent(@Param('id', ParseUUIDPipe) eventId) {
    return this.eventService.deleteEvent(eventId);
  }
}
