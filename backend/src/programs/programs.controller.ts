import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgramsService } from './programs.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('programs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProgramsController {
  constructor(private programs: ProgramsService) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findAll(@Request() req: any, @Query('mine') mine?: string) {
    const creatorId = mine === 'true' ? req.user.id : undefined;
    return this.programs.findAll(creatorId);
  }

  // ============================================================
  // NEW: per-profile assignment routes
  // Must be declared BEFORE `:id` routes so Nest matches correctly
  // ============================================================

  // GET /programs/profile/:profileId
  // List all programs assigned to a specific profile
  @Get('profile/:profileId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findAssignmentsForProfile(@Param('profileId') profileId: string) {
    return this.programs.findAssignmentsForProfile(profileId);
  }

  // POST /programs/:programId/assign/:profileId
  // Assign a program to a profile (or update the existing assignment)
  @Post(':programId/assign/:profileId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  assignToProfile(
    @Param('programId') programId: string,
    @Param('profileId') profileId: string,
    @Body() body: { startDate?: string | null; activities?: any },
  ) {
    return this.programs.assignToProfile(programId, profileId, body || {});
  }

  // PATCH /programs/:programId/assign/:profileId
  // Update the per-profile activities of an existing assignment
  @Patch(':programId/assign/:profileId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  updateAssignmentActivities(
    @Param('programId') programId: string,
    @Param('profileId') profileId: string,
    @Body() body: { activities: any },
  ) {
    return this.programs.updateAssignmentActivities(
      programId,
      profileId,
      body?.activities,
    );
  }

  // DELETE /programs/:programId/assign/:profileId
  // Remove a program from a profile
  @Delete(':programId/assign/:profileId')
  @Roles('ADMIN', 'SUPERVISOR')
  unassignFromProfile(
    @Param('programId') programId: string,
    @Param('profileId') profileId: string,
  ) {
    return this.programs.unassignFromProfile(programId, profileId);
  }

  // ============================================================
  // Original routes (must come AFTER the specific routes above)
  // ============================================================

  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  findOne(@Param('id') id: string) { return this.programs.findOne(id); }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  create(@Body() body: any, @Request() req: any) {
    return this.programs.create(body, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  update(@Param('id') id: string, @Body() body: any) {
    return this.programs.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  remove(@Param('id') id: string) { return this.programs.remove(id); }
}