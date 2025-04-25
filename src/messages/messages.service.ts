import { BadRequestException, Injectable } from '@nestjs/common';

import { ConversationsRepository } from '../conversations/conversations.repository';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateMessageRequestDto } from './dto/message.request.dto';
import { CreateMessageResponseDto } from './dto/message.response.dto';
import { MessagesRepository } from './messages.repository';
import { Message } from './schemas/messages.schema';

@Injectable()
export class MessagesService {
  constructor(
    private readonly repo: MessagesRepository,
    private readonly conversationRepo: ConversationsRepository,
  ) {}

  public async createMessage(
    payload: CreateMessageRequestDto,
  ): Promise<CreateMessageResponseDto> {
    try {
      const conversation = await this.conversationRepo.findOne(
        payload.conversationId,
      );
      if (!conversation) {
        throw new Error(`Conversation ${payload.conversationId} not found!`);
      }
      const user = RequestContextService.getUser();
      const message = new Message();
      message.conversationId = payload.conversationId;
      message.content = payload.content;
      message.metadata = payload.metadata;
      message.createdBy = user.userId;
      message.updatedBy = user.userId;
      const newConversation = await this.repo.insert(message);

      return {
        id: newConversation.id,
        message: 'Success Create Message',
      } as CreateMessageResponseDto;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
