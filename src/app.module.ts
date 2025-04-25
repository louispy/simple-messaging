import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    AuthModule,
    DatabaseModule,
    LoggerModule,
    ConversationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
