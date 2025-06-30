import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';

import { ElasticSearchIndexingService } from './elasticsearch-indexing.service';
import { ElasticSearchCircuitBreakerConfig } from './interfaces/elasticsearch.interface';
import {
  ELASTICSEARCH_CIRCUIT_BREAKER_CONFIG,
  ELASTICSEARCH_MESSAGES_INDEX,
} from './interfaces/elasticsearch.tokens.interface';

@Module({
  imports: [
    ConfigModule,
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
  providers: [
    {
      provide: ELASTICSEARCH_MESSAGES_INDEX,
      useFactory: (config: ConfigService) =>
        config.get<string>('ELASTICSEARCH_MESSAGES_INDEX', 'messages'),
      inject: [ConfigService],
    },
    {
      provide: ELASTICSEARCH_CIRCUIT_BREAKER_CONFIG,
      useFactory: (config: ConfigService) =>
        ({
          timeout: config.get<number>(
            'ELASTICSEARCH_CIRCUIT_BREAKER_TIMEOUT',
            10000,
          ),
          errorThreshold: config.get<number>(
            'ELASTICSEARCH_CIRCUIT_BREAKER_ERROR_THRESHOLD',
            50,
          ),
          resetTimeout: config.get<number>(
            'ELASTICSEARCH_CIRCUIT_BREAKER_RESET_TIMEOUT',
            60000,
          ),
          volumeThreshold: config.get<number>(
            'ELASTICSEARCH_CIRCUIT_BREAKER_VOLUMNE_THRESHOLD',
            5,
          ),
        }) as ElasticSearchCircuitBreakerConfig,
      inject: [ConfigService],
    },
    ElasticSearchIndexingService,
  ],
  exports: [NestElasticsearchModule, ElasticSearchIndexingService],
})
export class ElasticsearchModule {}
