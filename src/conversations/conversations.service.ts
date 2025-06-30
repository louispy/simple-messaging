import { BadRequestException, Injectable } from '@nestjs/common';

import { RequestContextService } from '../request-context/request-context.service';
import { ConversationsRepository } from './conversations.repository';
import { CreateConversationRequestDto } from './dto/conversation.request.dto';
import { CreateConversationResponseDto } from './dto/conversation.response.dto';
import { Conversation } from './schemas/conversations.schema';

@Injectable()
export class ConversationsService {
  constructor(private readonly repo: ConversationsRepository) {}

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
}
