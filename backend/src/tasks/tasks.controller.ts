import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Request() req: any) {
    // If Admin/Supervisor, show all tasks. If Staff, show only their tasks.
    const creatorId = req.user.role === 'ADMIN' || req.user.role === 'SUPERVISOR' ? undefined : req.user.id;
    return this.tasksService.findAll(creatorId);
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.tasksService.create(body, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}