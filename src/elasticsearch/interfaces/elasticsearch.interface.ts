export interface ElasticSearchCircuitBreakerConfig {
  timeout: number;
  errorThreshold: number;
  resetTimeout: number;
  volumeThreshold: number;
}