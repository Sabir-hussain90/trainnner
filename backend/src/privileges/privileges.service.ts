import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  defaultPrivileges,
  sanitizePrivileges,
  PrivilegeKey,
  PrivilegeMatrix,
  RoleKey,
} from './default-privileges';

@Injectable()
export class PrivilegesService {
  private readonly logger = new Logger(PrivilegesService.name);
  private cache: PrivilegeMatrix | null = null;

  constructor(private prisma: PrismaService) {}

  async get(): Promise<PrivilegeMatrix> {
    if (this.cache) return this.cache;

    const row = await this.prisma.privileges.findUnique({
      where: { id: 'singleton' },
    });

    if (!row) {
      const initial = defaultPrivileges();
      await this.prisma.privileges.create({
        data: { id: 'singleton', data: initial as any },
      });
      this.cache = initial;
      return initial;
    }

    this.cache = sanitizePrivileges(row.data);
    return this.cache;
  }

  async update(input: any): Promise<PrivilegeMatrix> {
    const clean = sanitizePrivileges(input);
    await this.prisma.privileges.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', data: clean as any },
      update: { data: clean as any },
    });
    this.cache = clean;
    this.logger.log('Privileges updated');
    return clean;
  }

  async assert(role: string | undefined, key: PrivilegeKey): Promise<boolean> {
    if (!role) return false;
    const roleKey = role.toLowerCase() as RoleKey;
    const matrix = await this.get();
    return matrix[key]?.[roleKey] === true;
  }
}