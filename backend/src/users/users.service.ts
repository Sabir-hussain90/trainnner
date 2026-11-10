import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ============ ROLE-FILTERED LIST ============
  findAll(requester?: { id: string; role: string }) {
    const role = requester?.role;

    let where: any = {};

    if (role === 'ADMIN') {
      where = {};
    } else if (role === 'SUPERVISOR') {
      where = { role: 'STAFF' };
    } else {
      return [];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    // FIX: Handle the Super Admin from .env
    if (id === 'super-admin-id') {
      return {
        id: 'super-admin-id',
        firstName: 'Super',
        lastName: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        role: 'ADMIN',
        phone: null,
        profilePhoto: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, body: any) {
    // FIX: Prevent editing the .env Super Admin
    if (id === 'super-admin-id') {
      throw new BadRequestException('Cannot edit the Super Admin account from here.');
    }

    await this.findOne(id);

    const data: any = {};
    if (body.firstName !== undefined) data.firstName = body.firstName.trim();
    if (body.lastName !== undefined) data.lastName = body.lastName.trim();
    if (body.email !== undefined) data.email = body.email.trim().toLowerCase();
    if (body.role !== undefined) data.role = body.role;
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null;
    if (body.profilePhoto !== undefined) data.profilePhoto = body.profilePhoto || null;
    if (body.status !== undefined) data.status = body.status;

    if (body.password) {
      if (body.password.length < 8)
        throw new BadRequestException('password must be at least 8 characters');
      data.password = await bcrypt.hash(body.password, 10);
    }

    if (data.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (exists) throw new ConflictException('Email already in use');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    // FIX: Prevent deleting the .env Super Admin
    if (id === 'super-admin-id') {
      throw new BadRequestException('Cannot delete the Super Admin account.');
    }

    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}