import { Module } from '@nestjs/common';

import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { KafkaConsumerModule } from '../kafka/kafka.consumer.module';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [KafkaConsumerModule, ElasticsearchModule],
  controllers: [ConsumerController],
  providers: [
    ConsumerService,
  ],
})
export class ConsumerModule {}
