import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExercisesService } from './exercises.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('exercises')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExercisesController {
  constructor(private exercises: ExercisesService) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findAll(@Request() req: any, @Query('mine') mine?: string) {
    const creatorId = mine === 'true' ? req.user.id : undefined;
    return this.exercises.findAll(creatorId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findOne(@Param('id') id: string) { return this.exercises.findOne(id); }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  create(@Body() body: any, @Request() req: any) {
    return this.exercises.create(body, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  update(@Param('id') id: string, @Body() body: any) {
    return this.exercises.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  remove(@Param('id') id: string) { return this.exercises.remove(id); }
}