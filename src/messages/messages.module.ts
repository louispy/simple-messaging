import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConversationsRepository } from '../conversations/conversations.repository';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversations.schema';
import { KafkaProducerModule } from '../kafka/kafka.producer.module';
import { LOGGER } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
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
    KafkaProducerModule,
  ],
  controllers: [MessagesController],
  providers: [
    MessagesRepository,
    ConversationsRepository,
    { provide: LOGGER, useClass: LoggerService },
    MessagesService,
  ],
})
export class MessagesModule {}
