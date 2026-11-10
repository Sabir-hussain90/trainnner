import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.report.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.report.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Report not found');
    return r;
  }

  create(body: any, creatorId: string) {
    return this.prisma.report.create({
      data: {
        name: body.name,
        type: body.type || 'metrics',
        data: body.data || {},
        periodStart: body.periodStart ? new Date(body.periodStart) : null,
        periodEnd: body.periodEnd ? new Date(body.periodEnd) : null,
        creatorId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.report.delete({ where: { id } });
    return { success: true };
  }
}