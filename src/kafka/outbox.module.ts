import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { LOGGER } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { RedisModule } from '../redis/redis.module';
import { KafkaProducerModule } from './kafka.producer.module';
import { OutboxRepository } from './outbox.repository';
import { CRON_EXPRESSION, OutboxService } from './outbox.service';
import { Outbox, OutboxSchema } from './schemas/outbox.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: Outbox.name, schema: OutboxSchema }]),
    KafkaProducerModule,
    RedisModule,
  ],
  providers: [
    OutboxRepository,
    { provide: LOGGER, useClass: LoggerService },
    { provide: CRON_EXPRESSION, useValue: '*/10 * * * * *' },
    OutboxService,
  ],
})
export class OutboxModule {}
