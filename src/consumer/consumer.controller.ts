import { Controller } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

const topics = {
  indexMessage: process.env.KAFKA_TOPIC_INDEX_MESSAGE,
};

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(topics.indexMessage)
  async handleMessage(@Payload() payload: any, @Ctx() context: KafkaContext) {
    return this.consumerService.retry(payload, context);
  }

}
