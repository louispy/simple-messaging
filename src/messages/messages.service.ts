import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ConversationsRepository } from '../conversations/conversations.repository';
import { KafkaTopic } from '../kafka/interfaces/kafka.interface';
import { KAFKA_TOPIC } from '../kafka/interfaces/kafka.tokens.interface';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { ILogger, LOGGER } from '../logger/logger.interface';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateMessageRequestDto } from './dto/message.request.dto';
import { CreateMessageResponseDto } from './dto/message.response.dto';
import { MessagesRepository } from './messages.repository';
import { Message } from './schemas/messages.schema';

@Injectable()
export class MessagesService {
  constructor(
    private readonly repo: MessagesRepository,
    private readonly conversationRepo: ConversationsRepository,
    private readonly kafkaProducerService: KafkaProducerService,
    @Inject(LOGGER)
    private readonly logger: ILogger,
    @Inject(KAFKA_TOPIC)
    private readonly kafkaTopic: KafkaTopic,
  ) {}

  public async createMessage(
    payload: CreateMessageRequestDto,
  ): Promise<CreateMessageResponseDto> {
    try {
      const conversation = await this.conversationRepo.findOne(
        payload.conversationId,
      );
      if (!conversation) {
        throw new Error(`Conversation ${payload.conversationId} not found!`);
      }
      const now = new Date();
      const user = RequestContextService.getUser();
      const message = new Message();
      message.conversationId = payload.conversationId;
      message.content = payload.content;
      message.metadata = payload.metadata;
      message.createdBy = user.userId;
      message.updatedBy = user.userId;
      message.timestamp = payload.timestamp ? new Date(payload.timestamp) : now;
      const newMessage = await this.repo.insert(message);

      await this.kafkaProducerService
        .sendMessage(this.kafkaTopic.indexMessage, randomUUID(), newMessage, {
          timestamp: now,
        })
        .catch((err) => {
          this.logger.error('error while producing message', err);
        });
      return {
        id: newMessage.id,
        message: 'Success Create Message',
      } as CreateMessageResponseDto;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
