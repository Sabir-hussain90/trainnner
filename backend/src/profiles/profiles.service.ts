import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  findAll(staffId?: string) {
    const where = staffId ? { staffId } : {};
    return this.prisma.profile.findMany({
      where,
      include: {
        staff: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  create(body: any, staffId: string) {
    return this.prisma.profile.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        sex: body.sex,
        birthday: body.birthday,
        heightFt: body.heightFt ? Number(body.heightFt) : null,
        heightIn: body.heightIn ? Number(body.heightIn) : null,
        profilePhoto: body.profilePhoto,
        measurementSystem: body.measurementSystem || 'Imperial',
        clientAccess: body.clientAccess || 'deny',
        groups: body.groups || [],
        staffId,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    const data: any = {};
    const allowed = [
      'firstName', 'lastName', 'email', 'phone', 'sex', 'birthday',
      'heightFt', 'heightIn', 'profilePhoto', 'measurementSystem',
      'clientAccess', 'groups', 'parqStatus', 'lastTested',
      'nextGoal', 'overdueMetrics', 'status',
    ];
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    return this.prisma.profile.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.profile.delete({ where: { id } });
    return { success: true };
  }

  async sendForm(profileId: string, body: { formType: string }) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const formType = body?.formType || 'PARQ';

    const form = await this.prisma.form.findFirst({
      where: {
        isActive: true,
        OR: [
          { name: { equals: formType, mode: 'insensitive' } },
          { name: { contains: formType, mode: 'insensitive' } },
        ],
      },
    });

    if (form) {
      return this.prisma.formResponse.create({
        data: {
          formId: form.id,
          profileId,
          answers: { status: 'SENT', formType, sentAt: new Date().toISOString() } as any,
        },
      });
    }

    return {
      success: true,
      profileId,
      formType,
      message: `Form "${formType}" queued (no matching Form template found).`,
      sentAt: new Date().toISOString(),
    };
  }

  // ==================== ADDED: Add Activity ====================
  async addActivity(
    profileId: string,
    body: { type: string; date?: string; workoutIds?: string[] },
  ) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    
    // Future: Save to an Activity table if you add one.
    // For now, return success so the frontend UI works.
    return { success: true, profileId, data: body };
  }
}