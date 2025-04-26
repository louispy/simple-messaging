import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { KafkaConsumerModule } from '../kafka/kafka.consumer.module';

@Module({
  imports: [KafkaConsumerModule],
  controllers: [ConsumerController],
  providers: [ConsumerService],
})
export class ConsumerModule {}
