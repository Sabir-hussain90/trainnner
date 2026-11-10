import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(AuthGuard('jwt'))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Request() req: any) {
    // Admin/Supervisor see all, Staff see only their own
    const creatorId = req.user.role === 'ADMIN' || req.user.role === 'SUPERVISOR' ? undefined : req.user.id;
    return this.eventsService.findAll(creatorId);
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.eventsService.create(body, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}