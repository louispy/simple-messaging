import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ConversationsService } from './conversations.service';
import {
  CreateConversationRequestDto,
  GetMessagesRequestDto,
} from './dto/conversation.request.dto';
import {
  CreateConversationResponseDto,
  GetMessagesResponseDto,
} from './dto/conversation.response.dto';
import { ValidateObjectIdPipe } from '../common/pipes/oid.pipe';

@Controller('/v1/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  createConversation(
    @Body() payload: CreateConversationRequestDto,
  ): Promise<CreateConversationResponseDto> {
    return this.conversationsService.create(payload);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Query() query: GetMessagesRequestDto,
  ): Promise<GetMessagesResponseDto> {
    query.conversationId = id;
    return this.conversationsService.getMessages(query);
  }
}
