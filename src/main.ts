import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ResponseSerializerInterceptor } from './common/interceptors/response.serializer.interceptor';
import { ConsumerAppModule } from './consumer.app.module';
import { Transport } from '@nestjs/microservices';
import { OutboxAppModule } from './outbox.app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true, origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseSerializerInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}

async function bootstrapConsumer() {
  const app = await NestFactory.createMicroservice(ConsumerAppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        clientId: process.env.KAFKA_CLIENT_ID,
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID,
        allowTopicAutoCreation: true,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });
  await app.listen();
}

async function bootstrapOutbox() {
  const app = await NestFactory.createApplicationContext(OutboxAppModule);
  console.log('outbox app is up!');
}

if (require.main === module) {
  const mode = process.env.MODE;
  if (mode === 'consumer') {
    bootstrapConsumer();
  } else if (mode === 'outbox') {
    bootstrapOutbox();
  } else {
    bootstrap();
  }
}
