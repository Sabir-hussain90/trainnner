import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(body: any, creatorId: string) {
    return this.prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type || 'GENERAL',
        priority: body.priority || 'NORMAL',
        status: 'OPEN',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        assignees: body.assignees || [],
        profiles: body.profiles || [],
        creatorId,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        priority: body.priority,
        status: body.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        completedDate: body.completedDate ? new Date(body.completedDate) : undefined,
        assignees: body.assignees,
        profiles: body.profiles,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }
}