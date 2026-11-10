import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findAll(@Request() req: any, @Query('mine') mine?: string) {
    const creatorId = mine === 'true' ? req.user.id : undefined;
    return this.reports.findAll(creatorId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findOne(@Param('id') id: string) { return this.reports.findOne(id); }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  create(@Body() body: any, @Request() req: any) {
    return this.reports.create(body, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  remove(@Param('id') id: string) { return this.reports.remove(id); }
}