import { Body, Controller, Post } from '@nestjs/common';

import { ConversationsService } from './conversations.service';
import { CreateConversationRequestDto } from './dto/conversation.request.dto';
import { CreateConversationResponseDto } from './dto/conversation.response.dto';

@Controller('/v1/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  createConversation(
    @Body() payload: CreateConversationRequestDto,
  ): Promise<CreateConversationResponseDto> {
    return this.conversationsService.create(payload);
  }
}
