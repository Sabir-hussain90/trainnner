import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.program.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.program.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Program not found');
    return p;
  }

  create(body: any, creatorId: string) {
    return this.prisma.program.create({
      data: {
        name: body.name,
        description: body.description,
        weeks: Number(body.weeks) || 1,
        access: body.access || 'MYSELF',
        visibility: body.visibility || 'ALL_WORKOUTS',
        metrics: body.metrics || [],
        activities: body.activities || {},
        creatorId,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.program.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        weeks: body.weeks !== undefined ? Number(body.weeks) : undefined,
        access: body.access,
        visibility: body.visibility,
        metrics: body.metrics,
        activities: body.activities,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.program.delete({ where: { id } });
    return { success: true };
  }

  // ============================================================
  // NEW: per-profile program assignment
  // ============================================================

  /**
   * Assign a program to a profile (creates or returns existing assignment).
   * Copies the program's template activities into the assignment so the
   * profile has its own editable copy.
   */
  async assignToProfile(
    programId: string,
    profileId: string,
    body: { startDate?: string | null; activities?: any } = {},
  ) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException('Program not found');

    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const startDate = body.startDate ? new Date(body.startDate) : null;

    // If already assigned, update startDate + optional activities override
    const existing = await this.prisma.profileProgram.findUnique({
      where: { profileId_programId: { profileId, programId } },
    });

    if (existing) {
      return this.prisma.profileProgram.update({
        where: { id: existing.id },
        data: {
          startDate: startDate ?? existing.startDate,
          activities:
            body.activities !== undefined
              ? body.activities
              : existing.activities,
        },
        include: { program: true, profile: true },
      });
    }

    // New assignment — seed activities from the program template
    return this.prisma.profileProgram.create({
      data: {
        profileId,
        programId,
        startDate,
        activities:
          body.activities !== undefined
            ? body.activities
            : (program.activities as any) || {},
      },
      include: { program: true, profile: true },
    });
  }

  /**
   * Update a per-profile assignment's activities.
   */
  async updateAssignmentActivities(
    programId: string,
    profileId: string,
    activities: any,
  ) {
    const assignment = await this.prisma.profileProgram.findUnique({
      where: { profileId_programId: { profileId, programId } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    return this.prisma.profileProgram.update({
      where: { id: assignment.id },
      data: { activities: activities ?? {} },
      include: { program: true, profile: true },
    });
  }

  /**
   * Get all program assignments for a given profile.
   * Includes the full program details so the UI can show
   * weeks/duration/metrics.
   */
  async findAssignmentsForProfile(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.profileProgram.findMany({
      where: { profileId },
      include: {
        program: {
          include: {
            creator: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Remove a program assignment from a profile.
   */
  async unassignFromProfile(programId: string, profileId: string) {
    const assignment = await this.prisma.profileProgram.findUnique({
      where: { profileId_programId: { profileId, programId } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.prisma.profileProgram.delete({ where: { id: assignment.id } });
    return { success: true };
  }
}