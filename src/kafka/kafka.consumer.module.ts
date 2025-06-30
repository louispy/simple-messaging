import { Module } from '@nestjs/common';

import { KafkaProducerService } from './kafka.producer.service';

@Module({
  exports: [KafkaProducerService],
})
export class KafkaModule {}
