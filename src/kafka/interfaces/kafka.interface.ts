export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId: string;
  topics: string[];
}

export interface KafkaTopic {
  indexMessage: string;
}