import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as CircuitBreaker from 'opossum';

import { ElasticSearchCircuitBreakerConfig } from './interfaces/elasticsearch.interface';
import {
  ELASTICSEARCH_CIRCUIT_BREAKER_CONFIG,
  ELASTICSEARCH_MESSAGES_INDEX,
} from './interfaces/elasticsearch.tokens.interface';

@Injectable()
export class ElasticSearchIndexingService {
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    @Inject(ELASTICSEARCH_MESSAGES_INDEX) private readonly index: string,
    @Inject(ELASTICSEARCH_CIRCUIT_BREAKER_CONFIG)
    private readonly circuitBreakerConfig: ElasticSearchCircuitBreakerConfig,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    const indexDocumentFunction = async (body: any, id: string) => {
      // throw new InternalServerErrorException('everything is on fire!!');
      return await this.elasticsearchService.index({
        index: this.index,
        body: body,
        id: id,
      });
    };

    const circuitBreakerOptions: CircuitBreaker.Options = {
      timeout: this.circuitBreakerConfig.timeout, // Call to ES will timeout if it takes longer than 10s
      errorThresholdPercentage: this.circuitBreakerConfig.errorThreshold, // Trip if 50% of calls fail in rolling window
      resetTimeout: this.circuitBreakerConfig.resetTimeout, // Wait 60 seconds before half-opening
      volumeThreshold: this.circuitBreakerConfig.volumeThreshold, // Minimum number of requests in a rolling window to trip
      errorFilter: (err: any) => {
        // Only count network errors, timeouts, and 5xx as circuit breaker failures
        if (err.name === 'CircuitBreakerError') return false; // Errors from circuit breaker itself should count
        if (err.response) {
          const status = err.response.status || err.response.statusCode;
          if (status >= 500) {
            return false;
          }
          if (status >= 400) {
            return true;
          }
        }
        return false;
      },
    };

    this.circuitBreaker = new CircuitBreaker(
      indexDocumentFunction,
      circuitBreakerOptions,
    );

    this.circuitBreaker.on('open', () =>
      console.warn(
        'Elasticsearch Circuit Breaker: OPEN! ES is deemed unhealthy.',
      ),
    );
    this.circuitBreaker.on('halfOpen', () =>
      console.warn(
        'Elasticsearch Circuit Breaker: HALF-OPEN. Probing ES health.',
      ),
    );
    this.circuitBreaker.on('close', () =>
      console.info('Elasticsearch Circuit Breaker: CLOSED. ES has recovered.'),
    );
    this.circuitBreaker.on('reject', () =>
      console.error(
        'Elasticsearch Circuit Breaker: Call rejected (circuit OPEN or HALF-OPEN test failed).',
      ),
    );
    this.circuitBreaker.on('timeout', () =>
      console.error('Elasticsearch Circuit Breaker: Indexing call timed out.'),
    );
    this.circuitBreaker.on('fallback', (err: any, ...args: any[]) =>
      console.warn(
        `Elasticsearch Circuit Breaker: Fallback triggered for call with args: ${JSON.stringify(args)}. Error: ${err.message}`,
      ),
    );
  }

  async indexMessage(body: any, id: string): Promise<void> {
    try {
      // Use the circuit breaker to execute the indexing operation
      await this.circuitBreaker.fire(body, id);
      console.log(`Document with ID ${id} successfully sent to Elasticsearch.`);
    } catch (error) {
      console.error(
        `Failed to index message with ID ${id} via circuit breaker: ${error.message}`,
      );
      throw error; // Re-throw to inform the caller (ConsumerService)
    }
  }
}
