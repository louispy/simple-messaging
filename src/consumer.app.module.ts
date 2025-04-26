import 'reflect-metadata';

import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { ConsumerModule } from './consumer/consumer.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LoggerModule, ConsumerModule],
})
export class ConsumerAppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AppLoggerMiddleware).forRoutes('*');
  //   consumer.apply(RequestContextMiddleware).forRoutes('*');
  // }
}
