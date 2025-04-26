import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  ELASTICSEARCH_MESSAGES_INDEX,
  ElasticsearchModule,
} from '../elasticsearch/elasticsearch.module';
import { MessagesRepository } from '../messages/messages.repository';
import { Message, MessageSchema } from '../messages/schemas/messages.schema';
import { ConversationsController } from './conversations.controller';
import { ConversationsRepository } from './conversations.repository';
import { ConversationsService } from './conversations.service';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    ElasticsearchModule,
  ],
  controllers: [ConversationsController],
  providers: [
    ConversationsRepository,
    MessagesRepository,
    {
      provide: ELASTICSEARCH_MESSAGES_INDEX,
      useFactory: (config: ConfigService) =>
        config.get('ELASTICSEARCH_MESSAGES_INDEX', 'messages'),
      inject: [ConfigService],
    },
    ConversationsService,
  ],
})
export class ConversationsModule {}
