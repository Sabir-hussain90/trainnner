import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.workout.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const w = await this.prisma.workout.findUnique({ where: { id } });
    if (!w) throw new NotFoundException('Workout not found');
    return w;
  }

  create(body: any, creatorId: string) {
    return this.prisma.workout.create({
      data: {
        name: body.name,
        // FIX: Force duration to be a String or Null
        duration: body.duration ? String(body.duration) : null,
        access: body.access || 'MYSELF',
        note: body.note,
        programName: body.programName || null,
        items: body.items || [],
        creatorId,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.workout.update({
      where: { id },
      data: {
        name: body.name,
        // FIX: Force duration to be a String or Null
        duration: body.duration ? String(body.duration) : null,
        access: body.access,
        note: body.note,
        programName: body.programName,
        items: body.items,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workout.delete({ where: { id } });
    return { success: true };
  }
}