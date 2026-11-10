import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  getMine(@Request() req: any) {
    return this.settings.getMine(req.user.id);
  }

  @Patch()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  updateMine(@Request() req: any, @Body() body: any) {
    return this.settings.updateMine(req.user.id, body);
  }
}