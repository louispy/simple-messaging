import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Message, MessageSchema } from '../messages/schemas/messages.schema';
import { ConversationsController } from './conversations.controller';
import { ConversationsRepository } from './conversations.repository';
import { ConversationsService } from './conversations.service';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversations.schema';
import { MessagesRepository } from '../messages/messages.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ConversationsController],
  providers: [
    ConversationsRepository,
    MessagesRepository,
    ConversationsService,
  ],
})
export class ConversationsModule {}
