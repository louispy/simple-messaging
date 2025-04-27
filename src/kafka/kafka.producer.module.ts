import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { KafkaProducerService } from './kafka.producer.service';
import { KAFKA_CLIENT, KAFKA_TOPIC } from './interfaces/kafka.tokens.interface';
import { KafkaTopic } from './interfaces/kafka.interface';
import { LOGGER } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT,
        useFactory: (config: ConfigService) => {
          const kafkaConfig = {
            clientId: config.get('KAFKA_CLIENT_ID', 'my-kafka-client'),
            brokers: config.get('KAFKA_BROKERS', 'localhost:9092').split(','),
            groupId: config.get('KAFKA_GROUP_ID', 'my-kafka-group'),
          };
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: kafkaConfig.clientId,
                brokers: kafkaConfig.brokers,
              },
              consumer: {
                groupId: kafkaConfig.groupId,
              },
              producerOnlyMode: true,
              producer: { allowAutoTopicCreation: true },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
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
    { provide: LOGGER, useClass: LoggerService },
    KafkaProducerService,
  ],
  exports: [KafkaProducerService, KAFKA_TOPIC],
})
export class KafkaProducerModule {}
