import { Injectable } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

import { ILogger } from '../logger/logger.interface';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export abstract class BaseKafkaConsumerService {
  protected readonly logger: ILogger;
  protected abstract handleMessage(payload: any, context: KafkaContext);

  public async retry(
    payload: any,
    context: KafkaContext,
    maxRetries = 3,
    delay = 1000,
  ) {
    let attempt = 0;
    do {
      try {
        await this.handleMessage(payload, context);
        break;
      } catch (err) {
        attempt++;
        this.logger.error('Error when consuming message. Retrying...', err);
        await sleep(delay * Math.pow(2, attempt - 1));
      }
    } while (attempt < maxRetries);
  }
}
