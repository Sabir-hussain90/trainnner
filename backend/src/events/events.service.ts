import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  create(body: any, creatorId: string) {
    return this.prisma.event.create({
      data: {
        title: body.title,
        type: body.type || 'WORKOUT', // Default to WORKOUT
        date: body.date ? new Date(body.date) : null,
        startTime: body.startTime,
        endTime: body.endTime,
        users: body.users || [],
        profiles: body.profiles || [],
        note: body.note,
        creatorId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { success: true };
  }
}