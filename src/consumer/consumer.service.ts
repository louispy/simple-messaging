import { Inject, Injectable } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

import { KafkaTopic } from '../kafka/interfaces/kafka.interface';
import { KAFKA_TOPIC } from '../kafka/interfaces/kafka.tokens.interface';
import { BaseKafkaConsumerService } from '../kafka/kafka.consumer.service';
import { IndexMessageMessageDto } from './dto/consumer.message.dto';
import {
  ClassTransformer,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class ConsumerService extends BaseKafkaConsumerService {
  constructor(@Inject(KAFKA_TOPIC) private readonly kafkaTopic: KafkaTopic) {
    super();
  }

  protected handleMessage(payload: any, context: KafkaContext) {
    if (!payload) return;
    const { data } = payload;
    const topic = context.getTopic();
    switch (topic) {
      case this.kafkaTopic.indexMessage:
        return this.indexMessage(data);
    }
  }

  private async indexMessage(data: any): Promise<void> {
    const msg: IndexMessageMessageDto = plainToInstance(
      IndexMessageMessageDto,
      data,
    );

    const errors = validateSync(msg);
    if (errors.length > 0) {
      throw new Error(`Payload validation failed: ${JSON.stringify(errors)}`);
    }

    console.log('success consume message!!');
    console.log(msg);
  }
}
