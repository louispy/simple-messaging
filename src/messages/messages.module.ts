import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConversationsRepository } from '../conversations/conversations.repository';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversations.schema';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';
import { Message, MessageSchema } from './schemas/messages.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesRepository, ConversationsRepository, MessagesService],
})
export class MessagesModule {}
