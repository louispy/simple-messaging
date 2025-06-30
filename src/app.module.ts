import 'reflect-metadata';

import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppLoggerMiddleware } from './common/middlewares/app.logger';
import { RequestContextMiddleware } from './common/middlewares/request.context';
import { ConfigModule } from './config/config.module';
import { ConversationsModule } from './conversations/conversations.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { MessagesModule } from './messages/messages.module';
// import { ConsumerModule } from './consumer/consumer.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    DatabaseModule,
    LoggerModule,
    ConversationsModule,
    MessagesModule,
    ElasticsearchModule,
    RedisModule,
    // ConsumerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
