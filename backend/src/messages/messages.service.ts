import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.conversation.findMany({
      include: {
        profile: true,
        trainer: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
      include: { profile: true, trainer: true, messages: true },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  // ============================================================
  // NEW: find (or lazily create) the conversation between a
  // profile and a trainer. Used by Profiles page "Messages" tab.
  // ============================================================
  async findByProfileAndTrainer(profileId: string, trainerId: string) {
    if (!profileId || !trainerId) {
      throw new NotFoundException('profileId and trainerId are required');
    }

    // Try to find an existing conversation for this pair
    let conv = await this.prisma.conversation.findFirst({
      where: { profileId, trainerId },
      include: { profile: true, trainer: true, messages: true },
      orderBy: { createdAt: 'asc' },
    });

    // If none exists yet, create an empty conversation stub so the
    // profile tab can render a proper thread with no messages.
    if (!conv) {
      conv = await this.prisma.conversation.create({
        data: {
          profileId,
          trainerId,
          status: 'ACTIVE',
          lastMessage: null,
          unread: false,
        },
        include: { profile: true, trainer: true, messages: true },
      });
    }

    // Return messages ordered oldest → newest for chat display
    return {
      ...conv,
      messages: (conv.messages || []).slice().sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    };
  }

  async create(body: any) {
    const conversation = await this.prisma.conversation.create({
      data: {
        profileId: body.profileId,
        trainerId: body.trainerId,
        status: 'ACTIVE',
        lastMessage: body.message,
        unread: true,
        messages: {
          create: {
            senderName: body.senderName || 'Trainer',
            body: body.message,
          },
        },
      },
      include: { profile: true, trainer: true, messages: true },
    });
    return conversation;
  }

  async reassign(id: string, newTrainerId: string) {
    await this.findOne(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { trainerId: newTrainerId },
      include: { profile: true, trainer: true },
    });
  }

  async markRead(id: string) {
    await this.findOne(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { unread: false },
      include: {
        profile: true,
        trainer: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async markAllRead() {
    const result = await this.prisma.conversation.updateMany({
      where: { unread: true },
      data: { unread: false },
    });
    return { updated: result.count };
  }

  async addMessage(
    conversationId: string,
    body: { senderName?: string; body: string },
  ) {
    await this.findOne(conversationId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          senderName: body.senderName || 'Trainer',
          body: body.body,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: body.body,
          unread: true,
          updatedAt: new Date(),
        },
      }),
    ]);

    return message;
  }
}