import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { PrismaModule } from '../prisma/prisma.module';   // ← ADD THIS

@Module({
  imports: [PrismaModule],                                 // ← ADD THIS
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}