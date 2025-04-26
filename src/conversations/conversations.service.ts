import { BadRequestException, Injectable } from '@nestjs/common';

import { getPagination } from '../common/utils';
import { MessagesRepository } from '../messages/messages.repository';
import { RequestContextService } from '../request-context/request-context.service';
import { ConversationsRepository } from './conversations.repository';
import {
  CreateConversationRequestDto,
  GetMessagesRequestDto,
} from './dto/conversation.request.dto';
import {
  CreateConversationResponseDto,
  GetMessagesResponseDto,
} from './dto/conversation.response.dto';
import { Conversation } from './schemas/conversations.schema';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly repo: ConversationsRepository,
    private readonly messagesRepo: MessagesRepository,
  ) {}

  async create(
    payload: CreateConversationRequestDto,
  ): Promise<CreateConversationResponseDto> {
    try {
      const user = RequestContextService.getUser();
      const conversation = new Conversation();
      conversation.createdBy = user.userId;
      conversation.updatedBy = user.userId;
      const newConversation = await this.repo.insert(conversation);

      return {
        id: newConversation.id,
        message: 'Success Create Conversation',
      } as CreateConversationResponseDto;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getMessages(
    payload: GetMessagesRequestDto,
  ): Promise<GetMessagesResponseDto> {
    const page = payload.page || 1;
    const limit = payload.limit || 10;
    const query: any = {
      conversationId: payload.conversationId,
    };

    const [messages, count] = await Promise.all([
      this.messagesRepo.find(query, page, limit, {
        sort: payload.sortBy || 'createdAt',
        sortDir: payload.sortDir || 'desc',
        select: payload.select,
      }),
      this.messagesRepo.count(query),
    ]);
    return {
      data: messages.map((message) => ({
        senderId: message.createdBy,
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata,
      })),
      paging: getPagination(page, limit, count),
    } as GetMessagesResponseDto;
  }
}
