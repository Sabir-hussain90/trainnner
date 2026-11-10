import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrivilegesService } from './privileges.service';

@Controller('privileges')
@UseGuards(AuthGuard('jwt'))
export class PrivilegesController {
  constructor(private readonly privileges: PrivilegesService) {}

  @Get()
  async get() {
    return this.privileges.get();
  }

  @Put()
  async update(@Req() req: any, @Body() body: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can change privileges');
    }
    return this.privileges.update(body);
  }
}