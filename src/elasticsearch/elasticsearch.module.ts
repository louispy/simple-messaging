import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';

export const ELASTICSEARCH_MESSAGES_INDEX = 'ELASTICSEARCH_MESSAGES_INDEX';

@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        node: config.get('ELASTICSEARCH_URL', 'http://localhost:9200'),
        headers: {
          accept: 'application/vnd.elasticsearch+json',
          'content-type': 'application/vnd.elasticsearch+json',
        },
        enableMetaHeader: false,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestElasticsearchModule],
})
export class ElasticsearchModule {}
