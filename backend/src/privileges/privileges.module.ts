import { Global, Module } from '@nestjs/common';
import { PrivilegesService } from './privileges.service';
import { PrivilegesController } from './privileges.controller';
import { PrivilegesGuard } from './privileges.guard';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  controllers: [PrivilegesController],
  providers: [PrivilegesService, PrivilegesGuard, PrismaService],
  exports: [PrivilegesService, PrivilegesGuard],
})
export class PrivilegesModule {}