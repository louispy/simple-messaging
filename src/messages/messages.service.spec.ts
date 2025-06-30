import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConversationsRepository } from '../conversations/conversations.repository';
import { KAFKA_TOPIC } from '../kafka/interfaces/kafka.tokens.interface';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { LOGGER } from '../logger/logger.interface';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateMessageRequestDto } from './dto/message.request.dto';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';
import { Message } from './schemas/messages.schema';

describe('MessagesService', () => {
  let service: MessagesService;
  let mockConversationsRepo: any;
  let mockMessagesRepo: any;
  let mockKafkaProducer: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockConversationsRepo = {
      findOne: jest.fn(),
    };

    mockMessagesRepo = {
      insert: jest.fn(),
    };

    mockKafkaProducer = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
    };

    mockLogger = {
      error: jest.fn(),
    };

    jest.spyOn(RequestContextService, 'getUser').mockReturnValue({
      userId: 'test-user-id',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConversationsRepository,
          useValue: mockConversationsRepo,
        },
        {
          provide: MessagesRepository,
          useValue: mockMessagesRepo,
        },
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducer,
        },
        {
          provide: LOGGER,
          useValue: mockLogger,
        },
        {
          provide: KAFKA_TOPIC,
          useValue: {
            indexMessage: 'test-index-message',
          },
        },
        MessagesService,
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    const testPayload: CreateMessageRequestDto = {
      conversationId: 'test-convo-id',
      content: 'Hello world',
      metadata: { important: true },
    };

    it('should successfully create and index a message', async () => {
      mockConversationsRepo.findOne.mockResolvedValue({ id: 'test-convo-id' });
      const mockSavedMessage = {
        id: 'new-message-id',
        ...testPayload,
      };
      mockMessagesRepo.insert.mockResolvedValue(mockSavedMessage);

      const result = await service.createMessage(testPayload);

      expect(mockConversationsRepo.findOne).toHaveBeenCalledWith(
        'test-convo-id',
      );
      expect(mockMessagesRepo.insert).toHaveBeenCalledWith(expect.any(Message));
      expect(mockKafkaProducer.sendMessage).toHaveBeenCalledWith(
        'test-index-message',
        expect.any(String),
        mockSavedMessage,
        { timestamp: expect.any(Date) },
      );
      expect(result).toEqual({
        id: 'new-message-id',
        message: 'Success Create Message',
      });
    });

    it('should throw BadRequestException if conversation not found', async () => {
      mockConversationsRepo.findOne.mockResolvedValue(null);

      await expect(service.createMessage(testPayload)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle Kafka producer errors gracefully', async () => {
      mockConversationsRepo.findOne.mockResolvedValue({ id: 'test-convo-id' });
      mockMessagesRepo.insert.mockResolvedValue({ id: 'new-message-id' });
      const kafkaError = new Error('Kafka failed');
      mockKafkaProducer.sendMessage.mockRejectedValue(kafkaError);

      const result = await service.createMessage(testPayload);

      expect(result).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'error while producing message',
        kafkaError,
      );
    });

    it('should use current timestamp if none provided', async () => {
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      mockConversationsRepo.findOne.mockResolvedValue({ id: 'test-convo-id' });
      mockMessagesRepo.insert.mockImplementation((msg) => Promise.resolve(msg));

      await service.createMessage({
        ...testPayload,
        timestamp: undefined,
      });

      expect(mockMessagesRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: now,
        }),
      );
      jest.useRealTimers();
    });

    it('should use provided timestamp if available', async () => {
      const customDate = new Date('2023-01-01');
      mockConversationsRepo.findOne.mockResolvedValue({ id: 'test-convo-id' });
      mockMessagesRepo.insert.mockImplementation((msg) => Promise.resolve(msg));

      await service.createMessage({
        ...testPayload,
        timestamp: customDate.toISOString(),
      });

      expect(mockMessagesRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: customDate,
        }),
      );
    });
  });
});
