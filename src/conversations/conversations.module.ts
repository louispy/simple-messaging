import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConversationsController } from './conversations.controller';
import { ConversationsRepository } from './conversations.repository';
import { ConversationsService } from './conversations.service';
import {
  Conversation,
  ConversationSchema,
} from './entities/conversations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsRepository, ConversationsService],
})
export class ConversationsModule {}
