import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KAFKA_CLIENT } from './interfaces/kafka.tokens.interface';
import { ILogger, LOGGER } from '../logger/logger.interface';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class KafkaProducerService {
  constructor(
    @Inject(KAFKA_CLIENT) private readonly client: ClientKafka,
    @Inject(LOGGER) private readonly logger: ILogger,
  ) {}

  public async onModuleInit() {
    await this.client.connect();
  }

  public async sendMessage(
    topic: string,
    key: string,
    message: any,
    metadata: any = {},
  ): Promise<void> {
    const payload = { key, value: JSON.stringify({ metadata, data: message }) };
    await this.retry(topic, payload);
  }

  private async retry(
    topic: string,
    payload: any,
    maxRetries = 3,
    delay = 1000,
  ) {
    let attempt = 0;
    do {
      try {
        await firstValueFrom(this.client.emit(topic, payload));
        break;
      } catch (err) {
        this.logger.error('Error publishing message. Retrying...', err);
        attempt++;
        await sleep(delay * Math.pow(3, attempt - 1));
      }
    } while (attempt < maxRetries);
  }
}
