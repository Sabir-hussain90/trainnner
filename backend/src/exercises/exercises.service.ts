import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.exercise.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const e = await this.prisma.exercise.findUnique({ where: { id } });
    if (!e) throw new NotFoundException('Exercise not found');
    return e;
  }

  create(body: any, creatorId: string) {
    return this.prisma.exercise.create({
      data: {
        name: body.name,
        access: body.access || 'MYSELF',
        units: body.units || ['Reps'],
        bodySegment: body.bodySegment,
        primaryMuscle: body.primaryMuscle,
        equipment: body.equipment,
        mechanics: body.mechanics,
        force: body.force,
        instructions: body.instructions,
        videoPlatform: body.videoPlatform || 'NONE',
        videoUrl: body.videoUrl,
        sourceLabel: body.sourceLabel,
        screenshot: body.screenshot,
        shareWithCommunity: !!body.shareWithCommunity,
        creatorId,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.exercise.update({
      where: { id },
      data: {
        name: body.name,
        access: body.access,
        units: body.units,
        bodySegment: body.bodySegment,
        primaryMuscle: body.primaryMuscle,
        equipment: body.equipment,
        mechanics: body.mechanics,
        force: body.force,
        instructions: body.instructions,
        videoPlatform: body.videoPlatform,
        videoUrl: body.videoUrl,
        sourceLabel: body.sourceLabel,
        screenshot: body.screenshot,
        shareWithCommunity: body.shareWithCommunity,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.exercise.delete({ where: { id } });
    return { success: true };
  }
}