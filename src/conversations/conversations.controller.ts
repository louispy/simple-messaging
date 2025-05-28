import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ValidateObjectIdPipe } from '../common/pipes/oid.pipe';
import { RequestContextService } from '../request-context/request-context.service';
import { ConversationsService } from './conversations.service';
import {
  CreateConversationRequestDto,
  GetMessagesRequestDto,
  SearchMessagesRequestDto,
} from './dto/conversation.request.dto';
import {
  CreateConversationResponseDto,
  GetMessagesResponseDto,
  SearchMessagesResponseDto,
} from './dto/conversation.response.dto';

@Controller('/v1/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  createConversation(
    @Body() payload: CreateConversationRequestDto,
  ): Promise<CreateConversationResponseDto> {
    const user = RequestContextService.getUser();
    payload.userId = user.userId;
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

  @Get(':id/messages/search')
  searchMessages(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Query() query: SearchMessagesRequestDto,
  ): Promise<SearchMessagesResponseDto> {
    query.conversationId = id;
    return this.conversationsService.searchMessages(query);
  }
}
