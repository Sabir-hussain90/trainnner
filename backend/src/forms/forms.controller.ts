import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FormsService } from './forms.service';

@Controller('forms')
@UseGuards(AuthGuard('jwt'))
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  findAll(@Query('creatorId') creatorId?: string) {
    return this.formsService.findAll(creatorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.formsService.create(body, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.formsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }
}