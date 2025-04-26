import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KafkaTopic } from './interfaces/kafka.interface';
import { KAFKA_TOPIC } from './interfaces/kafka.tokens.interface';

@Module({
  providers: [
    {
      provide: KAFKA_TOPIC,
      useFactory: (config: ConfigService) => {
        const kafkaTopic: KafkaTopic = {
          indexMessage: config.get(
            'KAFKA_TOPIC_INDEX_MESSAGE',
            'default-topic',
          ),
        };
        return kafkaTopic;
      },
      inject: [ConfigService],
    },
  ],
  exports: [KAFKA_TOPIC],
})
export class KafkaConsumerModule {}
