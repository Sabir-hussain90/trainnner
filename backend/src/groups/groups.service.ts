import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.group.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const g = await this.prisma.group.findUnique({ where: { id } });
    if (!g) throw new NotFoundException('Group not found');
    return g;
  }

  async create(body: any) {
    const {
      name,
      description,
      supervisors = [],
      staff = [],
      profiles = [],
      primaryColor = '#3b82f6',
      logo,
    } = body || {};

    if (!name?.trim()) throw new BadRequestException('name is required');

    return this.prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        supervisors: Array.isArray(supervisors) ? supervisors : [],
        staff: Array.isArray(staff) ? staff : [],
        profiles: Array.isArray(profiles) ? profiles : [],
        primaryColor: primaryColor || '#3b82f6',
        logo: logo || null,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);

    const data: any = {};
    if (body.name !== undefined) {
      if (!body.name?.trim()) throw new BadRequestException('name cannot be empty');
      data.name = body.name.trim();
    }
    if (body.description !== undefined)
      data.description = body.description?.trim() || null;
    if (body.supervisors !== undefined)
      data.supervisors = Array.isArray(body.supervisors) ? body.supervisors : [];
    if (body.staff !== undefined)
      data.staff = Array.isArray(body.staff) ? body.staff : [];
    if (body.profiles !== undefined)
      data.profiles = Array.isArray(body.profiles) ? body.profiles : [];
    if (body.primaryColor !== undefined)
      data.primaryColor = body.primaryColor || '#3b82f6';
    if (body.logo !== undefined) data.logo = body.logo || null;

    return this.prisma.group.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.group.delete({ where: { id } });
    return { success: true };
  }
}