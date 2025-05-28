import { Body, Controller, Post } from '@nestjs/common';

import { RequestContextService } from '../request-context/request-context.service';
import { CreateMessageRequestDto } from './dto/message.request.dto';
import { CreateMessageResponseDto } from './dto/message.response.dto';
import { MessagesService } from './messages.service';

@Controller('v1/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  createMessage(
    @Body() payload: CreateMessageRequestDto,
  ): Promise<CreateMessageResponseDto> {
    const user = RequestContextService.getUser();
    payload.userId = user.userId;
    return this.messagesService.createMessage(payload);
  }
}
