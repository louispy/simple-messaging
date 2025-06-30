import { Body, Controller, Post } from '@nestjs/common';

import { ConversationsService } from './conversations.service';
import { CreateConversationRequest } from './dto/conversation.request.dto';
import { CreateConversationResponse } from './dto/conversation.response.dto';

@Controller('/v1/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  createConversation(
    @Body() payload: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    return this.conversationsService.create(payload);
  }
}
