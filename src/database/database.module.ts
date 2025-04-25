import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

const mongooseModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    uri: config.get('MONGODB_URI'),
    retryAttempts: 5,
    retryDelay: 1000,
    connectionFactory: (connection) => {
      connection.on('connected', () => {
        Logger.log('Connected to MongoDB', 'NestApplication');
      });
      connection.on('disconnected', () => {
        Logger.log('Disconnected from MongoDB', 'NestApplication');
      });
      return connection;
    },
  }),
});

@Module({
  imports: [mongooseModule],
})
export class DatabaseModule {}
