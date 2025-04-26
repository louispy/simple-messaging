import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KAFKA_CLIENT } from './interfaces/kafka.tokens.interface';


@Injectable()
export class KafkaProducerService {
  constructor(@Inject(KAFKA_CLIENT) private readonly client: ClientKafka) {}

  public async onModuleInit() {
    await this.client.connect();
  }

  public sendMessage(
    topic: string,
    key: string,
    message: any,
    metadata: any = {},
  ): Promise<void> {
    const payload = { key, value: JSON.stringify({ metadata, data: message }) };
    return firstValueFrom(this.client.emit(topic, payload));
  }
}
