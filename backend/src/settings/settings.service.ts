import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getMine(userId: string) {
    let settings = await this.prisma.settings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: { userId, primaryColor: '#1a73e8' },
      });
    }
    return settings;
  }

  async updateMine(userId: string, body: any) {
    await this.getMine(userId);
    return this.prisma.settings.update({
      where: { userId },
      data: {
        primaryColor: body.primaryColor,
        accountLogo: body.accountLogo,
        integrations: body.integrations,
        businessInfo: body.businessInfo,
      },
    });
  }
}