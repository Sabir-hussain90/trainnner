import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, Request, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfilesService } from './profiles.service';
import { ProgramsService } from '../programs/programs.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProfilesController {
  constructor(
    private profiles: ProfilesService,
    private programs: ProgramsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findAll(@Request() req: any, @Query('mine') mine?: string) {
    const staffId = mine === 'true' && req.user.role === 'STAFF' ? req.user.id : undefined;
    return this.profiles.findAll(staffId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.profiles.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  create(@Body() body: any, @Request() req: any) {
    return this.profiles.create(body, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  update(@Param('id') id: string, @Body() body: any) {
    return this.profiles.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  remove(@Param('id') id: string) {
    return this.profiles.remove(id);
  }

  @Post(':id/programs')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  assignProgram(
    @Param('id') profileId: string,
    @Body() body: { programId: string; startDate?: string; activities?: any },
  ) {
    return this.programs.assignToProfile(body.programId, profileId, {
      startDate: body.startDate ?? null,
      activities: body.activities,
    });
  }

  @Post(':id/send-form')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  sendForm(
    @Param('id') profileId: string,
    @Body() body: { formType: string },
  ) {
    return this.profiles.sendForm(profileId, body);
  }

  // ==================== ADDED: Add Activity ====================
  @Post(':id/activities')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  addActivity(
    @Param('id') profileId: string,
    @Body() body: { type: string; date?: string; workoutIds?: string[] },
  ) {
    return this.profiles.addActivity(profileId, body);
  }
}