import 'reflect-metadata';

import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { OutboxModule } from './kafka/outbox.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LoggerModule, OutboxModule],
  controllers: [],
  providers: [],
})
export class OutboxAppModule {}
