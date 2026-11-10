import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  // ⚠️ IMPORTANT: static routes must be declared BEFORE :id routes
  @Patch('read-all')
  markAllRead() {
    return this.messagesService.markAllRead();
  }

  // ✅ NEW — must come BEFORE @Get(':id')
  // GET /messages/:profileId/:trainerId
  // Returns the thread for a specific profile + trainer.
  // Auto-creates an empty conversation if none exists yet.
  @Get(':profileId/:trainerId')
  findByProfileAndTrainer(
    @Param('profileId') profileId: string,
    @Param('trainerId') trainerId: string,
  ) {
    return this.messagesService.findByProfileAndTrainer(profileId, trainerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.messagesService.create(body);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.messagesService.markRead(id);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body() body: { senderName?: string; body: string },
  ) {
    return this.messagesService.addMessage(id, body);
  }

  @Patch(':id/reassign')
  reassign(@Param('id') id: string, @Body('trainerId') trainerId: string) {
    return this.messagesService.reassign(id, trainerId);
  }
}