import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { KafkaContext } from '@nestjs/microservices';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ELASTICSEARCH_MESSAGES_INDEX } from '../elasticsearch/elasticsearch.module';
import { KafkaTopic } from '../kafka/interfaces/kafka.interface';
import { KAFKA_TOPIC } from '../kafka/interfaces/kafka.tokens.interface';
import { BaseKafkaConsumerService } from '../kafka/kafka.consumer.service';
import { IndexMessageMessageDto } from './dto/consumer.message.dto';

@Injectable()
export class ConsumerService extends BaseKafkaConsumerService {
  constructor(
    @Inject(KAFKA_TOPIC) private readonly kafkaTopic: KafkaTopic,
    @Inject(ELASTICSEARCH_MESSAGES_INDEX) private readonly index: string,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
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
    try {
      const msg: IndexMessageMessageDto = plainToInstance(
        IndexMessageMessageDto,
        data,
      );

      const errors = validateSync(msg);
      if (errors.length > 0) {
        throw new Error(`Payload validation failed: ${JSON.stringify(errors)}`);
      }

      await this.elasticsearchService.index({
        index: this.index,
        body: instanceToPlain(msg),
        id: msg.id,
      });
      console.log('success consume message!!');
      console.log(msg);
    } catch (err) {
      console.error(err);
    }
  }
}
