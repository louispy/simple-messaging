import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KAFKA_CLIENT } from './interfaces/kafka.tokens.interface';
import { ILogger, LOGGER } from '../logger/logger.interface';
import { OutboxRepository } from './outbox.repository';
import { Outbox } from './schemas/outbox.schema';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class KafkaProducerService {
  private isConnected: boolean;
  private isConnecting: boolean;
  constructor(
    @Inject(KAFKA_CLIENT) private readonly client: ClientKafka,
    @Inject(LOGGER) private readonly logger: ILogger,
    private readonly outboxRepository: OutboxRepository,
  ) {
    this.isConnected = false;
    this.isConnecting = false;
  }

  public async onModuleInit() {
    this.attemptConnect();
  }

  private async attemptConnect() {
    try {
      this.isConnecting = true;
      await this.client.connect();
      this.isConnected = true;
      this.logger.log('KafkaProducer', 'Sucessfully connected to kafka');
    } catch (error) {
      this.logger.error('Failed to connect to kafka', error);
    } finally {
      this.isConnecting = false;
    }
  }

  private async ensureConnected(): Promise<boolean> {
    return this.isConnected;
  }

  public async sendMessage(
    topic: string,
    key: string,
    message: any,
    metadata: any = {},
  ): Promise<void> {
    if (!this.ensureConnected) {
      this.logger.error('Error sending kafka message', 'Kafka failed to initialized');
      return;
    }
    const payload = { key, value: JSON.stringify({ metadata, data: message }) };
    await this.retry(topic, payload);
  }

  public async sendMessageWithOutbox(
    topic: string,
    key: string,
    message: any,
    metadata: any = {},
    session?: any,
  ) {
    const outboxEvent = new Outbox();
    outboxEvent.topic = topic;
    outboxEvent.key = key;
    outboxEvent.message = JSON.stringify(message);
    outboxEvent.metadata = JSON.stringify(metadata);
    await this.outboxRepository.insert(outboxEvent, session);
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
