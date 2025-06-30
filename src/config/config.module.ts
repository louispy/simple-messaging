import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
