import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { ExercisesModule } from './exercises/exercises.module';
import { FormsModule } from './forms/forms.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ProgramsModule } from './programs/programs.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { TasksModule } from './tasks/tasks.module';
import { EventsModule } from './events/events.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { PrivilegesModule } from './privileges/privileges.module'; // <--- ADDED

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PrivilegesModule, // <--- ADDED (before feature modules so they can use it)
    AuthModule,
    ExercisesModule,
    FormsModule,
    ProfilesModule,
    ProgramsModule,
    ReportsModule,
    SettingsModule,
    WorkoutsModule,
    TasksModule,
    EventsModule,
    MessagesModule,
    UsersModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}