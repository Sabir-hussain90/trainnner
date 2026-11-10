import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.form.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const f = await this.prisma.form.findUnique({
      where: { id },
      include: { responses: true },
    });
    if (!f) throw new NotFoundException('Form not found');
    return f;
  }

  create(body: any, creatorId: string) {
    return this.prisma.form.create({
      data: {
        name: body.name,
        description: body.description,
        fields: body.fields || [],
        isActive: body.isActive !== false,
        creatorId,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.form.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        fields: body.fields,
        isActive: body.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.form.delete({ where: { id } });
    return { success: true };
  }
}