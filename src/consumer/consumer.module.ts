import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ELASTICSEARCH_MESSAGES_INDEX,
  ElasticsearchModule,
} from '../elasticsearch/elasticsearch.module';
import { KafkaConsumerModule } from '../kafka/kafka.consumer.module';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [KafkaConsumerModule, ElasticsearchModule],
  controllers: [ConsumerController],
  providers: [
    {
      provide: ELASTICSEARCH_MESSAGES_INDEX,
      useFactory: (config: ConfigService) =>
        config.get('ELASTICSEARCH_MESSAGES_INDEX', 'messages'),
      inject: [ConfigService],
    },
    ConsumerService,
  ],
})
export class ConsumerModule {}
