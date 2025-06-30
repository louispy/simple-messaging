import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import { ILogger } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { User, UserSchema } from '../users/entities/users.schema';
import { UsersRepository } from '../users/users.repository';
import { AdminUserSeederService } from './user.seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UsersRepository,
    LoggerService,
    AdminUserSeederService,
    {
      inject: [UsersRepository, LoggerService, ConfigService],
      provide: AdminUserSeederService,
      useFactory: (
        userRepo: UsersRepository,
        loggerService: ILogger,
        configService: ConfigService,
      ) => new AdminUserSeederService(userRepo, loggerService, configService),
    },
  ],
})
export class SeederModule {}
