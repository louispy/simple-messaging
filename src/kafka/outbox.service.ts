import { Inject, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import Redis from 'ioredis';

import { ILogger, LOGGER } from '../logger/logger.interface';
import { REDIS_CLIENT } from '../redis/redis.module';
import { KafkaProducerService } from './kafka.producer.service';
import { OutboxRepository } from './outbox.repository';
import { Outbox, OutboxEventStatus } from './schemas/outbox.schema';

export const CRON_EXPRESSION = 'CRON_EXPRESSION';

@Injectable()
export class OutboxService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly outboxRepo: OutboxRepository,
    private readonly kafkaProducerService: KafkaProducerService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(LOGGER) private readonly logger: ILogger,
    @Inject(CRON_EXPRESSION) private readonly cronExpression: string,
  ) {}

  onModuleInit() {
    this.addCronJob(
      'processPendingEvents',
      this.processPendingEvents.bind(this),
    );
  }

  addCronJob(name: string, job: () => void) {
    const cronTime = this.cronExpression || '*/10 * * * * *';

    const cronJob = new CronJob(cronTime, job);

    this.schedulerRegistry.addCronJob(name, cronJob);
    cronJob.start();
  }

  async processPendingEvents() {
    let isLocked = false;
    const key = `lock:outbox`;
    let pendingOutboxEvents: Outbox[] = [];
    try {
      const lockRes = await this.redis.set(key, 1, 'PX', 5000, 'NX');
      if (!lockRes) {
        throw new Error('Error locked');
      }
      isLocked = true;
      pendingOutboxEvents = await this.outboxRepo.find(
        {
          status: OutboxEventStatus.Pending,
        },
        1,
        10,
      );
      if (pendingOutboxEvents && pendingOutboxEvents.length) {
        await this.outboxRepo.updateMany(
          {
            _id: { $in: pendingOutboxEvents.map((e) => e.id) },
          },
          { status: OutboxEventStatus.Processing },
        );
      }
    } catch (err) {
      this.logger.error('OutboxService.processPendingEvents error', err);
      return;
    } finally {
      if (isLocked) {
        await this.redis.del(key).catch((err) => {
          this.logger.error(
            'OutboxService.processPendingEvents error unlock',
            err,
          );
        });
      }
    }

    const promises = pendingOutboxEvents.map(async (event) => {
      try {
        event.message = JSON.parse(event.message);
        event.metadata = JSON.stringify(event.metadata);
        const kafkaSuccess = await this.kafkaProducerService
          .sendMessage(event.topic, event.key, event.message, event.metadata)
          .then(() => true)
          .catch(() => false);
        await this.outboxRepo.updateOne(event.id, {
          status: kafkaSuccess
            ? OutboxEventStatus.Sent
            : OutboxEventStatus.Pending,
        });
      } catch (err) {
        this.logger.log('Error processing pending outbox event', err);
      }
    });

    await Promise.all(promises);
  }
}
