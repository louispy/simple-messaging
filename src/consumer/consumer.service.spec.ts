import { ElasticsearchService } from '@nestjs/elasticsearch';
import { KafkaContext } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as classValidator from 'class-validator';

import { ELASTICSEARCH_MESSAGES_INDEX } from '../elasticsearch/elasticsearch.module';
import { KafkaTopic } from '../kafka/interfaces/kafka.interface';
import { KAFKA_TOPIC } from '../kafka/interfaces/kafka.tokens.interface';
import { ConsumerService } from './consumer.service';

describe('ConsumerService', () => {
  let service: ConsumerService;
  let elasticsearchService: ElasticsearchService;
  let kafkaTopic: KafkaTopic;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        {
          provide: KAFKA_TOPIC,
          useValue: { indexMessage: 'index-message-topic' },
        },
        {
          provide: ELASTICSEARCH_MESSAGES_INDEX,
          useValue: 'messages-index',
        },
        {
          provide: ElasticsearchService,
          useValue: {
            index: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
    elasticsearchService =
      module.get<ElasticsearchService>(ElasticsearchService);
    kafkaTopic = module.get<KafkaTopic>(KAFKA_TOPIC);

    // Use jest.spyOn to mock validateSync
    jest.spyOn(classValidator, 'validateSync').mockImplementation(() => []);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleMessage', () => {
    it('should not process if payload is null or undefined', async () => {
      const context = {
        getTopic: () => kafkaTopic.indexMessage,
      } as KafkaContext;
      await service['handleMessage'](null, context);
      expect(elasticsearchService.index).not.toHaveBeenCalled();

      await service['handleMessage'](undefined, context);
      expect(elasticsearchService.index).not.toHaveBeenCalled();
    });

    it('should call indexMessage for the correct topic', async () => {
      const payload = { data: {} };
      const context = {
        getTopic: () => kafkaTopic.indexMessage,
      } as KafkaContext;
      jest
        .spyOn(service as any, 'indexMessage')
        .mockImplementation(() => Promise.resolve());

      await service['handleMessage'](payload, context);

      expect(service['indexMessage']).toHaveBeenCalledWith(payload.data);
    });

    it('should not call indexMessage for other topics', async () => {
      const payload = { data: {} };
      const context = { getTopic: () => 'other-topic' } as KafkaContext;

      jest
        .spyOn(service as any, 'indexMessage')
        .mockImplementation(() => Promise.resolve());
      await service['handleMessage'](payload, context);

      expect(service['indexMessage']).not.toHaveBeenCalled();
    });
  });

  describe('indexMessage', () => {
    it('should validate the message and index it to Elasticsearch', async () => {
      const mockMessageData = {
        id: 'message-id',
        content: 'message content',
        createdBy: 'user123',
        timestamp: new Date(),
      };

      (classValidator.validateSync as jest.Mock).mockReturnValue([]);
      (elasticsearchService.index as jest.Mock).mockResolvedValue({});

      await service['indexMessage'](mockMessageData);

      expect(classValidator.validateSync).toHaveBeenCalled();
      expect(elasticsearchService.index).toHaveBeenCalledWith({
        index: 'messages-index',
        body: expect.anything(),
        id: 'message-id',
      });
    });

    it('should throw an error if validation fails', async () => {
      const mockMessageData = {
        id: 'message-id',
        content: 'message content',
        createdBy: 'user123',
        timestamp: new Date(),
      };
      const validationErrors = [
        {
          property: 'id',
          constraints: { isNotEmpty: 'ID should not be empty' },
        },
      ];
      (classValidator.validateSync as jest.Mock).mockReturnValue(
        validationErrors,
      );

      await expect(
        service['indexMessage'](mockMessageData),
      ).rejects.toThrowError(
        'Payload validation failed: [{"property":"id","constraints":{"isNotEmpty":"ID should not be empty"}}]',
      );
      expect(elasticsearchService.index).not.toHaveBeenCalled();
    });

    it('should handle Elasticsearch errors', async () => {
      const mockMessageData = {
        id: 'message-id',
        content: 'message content',
        createdBy: 'user123',
        timestamp: new Date(),
      };
      const errorMessage = 'Elasticsearch error';
      (classValidator.validateSync as jest.Mock).mockReturnValue([]);
      const err = new Error(errorMessage);
      (elasticsearchService.index as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service['indexMessage'](mockMessageData)).rejects.toThrow(err);

    });
  });
});
