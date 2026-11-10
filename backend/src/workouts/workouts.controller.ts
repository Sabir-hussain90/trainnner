import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkoutsService } from './workouts.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('workouts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WorkoutsController {
  constructor(private workouts: WorkoutsService) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findAll(@Request() req: any, @Query('mine') mine?: string) {
    const creatorId = mine === 'true' ? req.user.id : undefined;
    return this.workouts.findAll(creatorId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findOne(@Param('id') id: string) { return this.workouts.findOne(id); }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  create(@Body() body: any, @Request() req: any) {
    return this.workouts.create(body, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  update(@Param('id') id: string, @Body() body: any) {
    return this.workouts.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  remove(@Param('id') id: string) { return this.workouts.remove(id); }
}