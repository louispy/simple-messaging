import { BadRequestException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';

import { ELASTICSEARCH_MESSAGES_INDEX } from '../elasticsearch/elasticsearch.module';
import { MessagesRepository } from '../messages/messages.repository';
import { RequestContextService } from '../request-context/request-context.service';
import { ConversationsRepository } from './conversations.repository';
import { ConversationsService } from './conversations.service';
import {
  CreateConversationRequestDto,
  GetMessagesRequestDto,
  SearchMessagesRequestDto,
} from './dto/conversation.request.dto';
import {
  CreateConversationResponseDto,
  GetMessagesResponseDto,
  SearchMessagesResponseDto,
} from './dto/conversation.response.dto';
import { Conversation } from './schemas/conversations.schema';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let conversationsRepository: ConversationsRepository;
  let messagesRepository: MessagesRepository;
  let elasticsearchService: ElasticsearchService;

  const mockUser = { userId: 'user123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: ConversationsRepository,
          useValue: {
            insert: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: MessagesRepository,
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: ELASTICSEARCH_MESSAGES_INDEX,
          useValue: 'messages',
        },
        {
          provide: ElasticsearchService,
          useValue: {
            search: jest.fn(),
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            getUser: jest.fn(() => mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    conversationsRepository = module.get<ConversationsRepository>(ConversationsRepository);
    messagesRepository = module.get<MessagesRepository>(MessagesRepository);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conversation and return the ID', async () => {
      const payload: CreateConversationRequestDto = {};
      const mockConversation = new Conversation();
      mockConversation.id = 'conversation123';
      (conversationsRepository.insert as jest.Mock).mockResolvedValue(mockConversation);

      const result: CreateConversationResponseDto = await service.create(payload);

      expect(conversationsRepository.insert).toHaveBeenCalledWith(expect.any(Conversation));
      expect(result).toEqual({
        id: 'conversation123',
        message: 'Success Create Conversation',
      });
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const payload: CreateConversationRequestDto = {};
      const errorMessage = 'Failed to create conversation';
      (conversationsRepository.insert as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(service.create(payload)).rejects.toThrowError(BadRequestException);
      await expect(service.create(payload)).rejects.toThrow(errorMessage);
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages for a conversation with pagination and sorting', async () => {
      const payload: GetMessagesRequestDto = {
        conversationId: 'conversation123',
        page: 2,
        limit: 5,
        sortBy: 'timestamp',
        sortDir: 'asc',
        select: 'id,content,timestamp,createdBy,conversationId,metadata',
      };
      const mockMessages = [
        {
          id: 'message1',
          conversationId: 'conversation123',
          content: 'Message 1',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          createdBy: 'user1',
          metadata: { key1: 'value1' },
        },
        {
          id: 'message2',
          conversationId: 'conversation123',
          content: 'Message 2',
          timestamp: new Date('2024-01-15T11:00:00Z'),
          createdBy: 'user2',
          metadata: { key1: 'value2' },
        },
      ];
      (messagesRepository.find as jest.Mock).mockResolvedValue(mockMessages);
      (messagesRepository.count as jest.Mock).mockResolvedValue(10);

      const result: GetMessagesResponseDto = await service.getMessages(payload);

      expect(messagesRepository.find).toHaveBeenCalledWith(
        { conversationId: 'conversation123' },
        2,
        5,
        {
          sort: 'timestamp',
          sortDir: 'asc',
          select: 'id,content,timestamp,createdBy,conversationId,metadata',
        },
      );
      expect(messagesRepository.count).toHaveBeenCalledWith({ conversationId: 'conversation123' });
      expect(result).toEqual({
        data: [
          {
            id: 'message1',
            conversationId: 'conversation123',
            content: 'Message 1',
            timestamp: '2024-01-15T10:00:00.000Z',
            senderId: 'user1',
            metadata: { key1: 'value1' },
          },
          {
            id: 'message2',
            conversationId: 'conversation123',
            content: 'Message 2',
            timestamp: '2024-01-15T11:00:00.000Z',
            senderId: 'user2',
            metadata: { key1: 'value2' },
          },
        ],
        paging: {
          page: 2,
          limit: 5,
          count: 10,
          totalPages: 2,
        },
      });
    });

      it('should handle default pagination values', async () => {
        const payload: GetMessagesRequestDto = { conversationId: 'conversation123' };
        const mockMessages = [];
        (messagesRepository.find as jest.Mock).mockResolvedValue(mockMessages);
        (messagesRepository.count as jest.Mock).mockResolvedValue(0);

        await service.getMessages(payload);

        expect(messagesRepository.find).toHaveBeenCalledWith(
          { conversationId: 'conversation123' },
          1,
          10,
          { sort: 'timestamp', sortDir: 'desc', select: undefined },
        );
      });
  });

  describe('searchMessages', () => {
    it('should search messages using Elasticsearch and return results', async () => {
      const payload: SearchMessagesRequestDto = {
        q: 'search query',
        page: 1,
        limit: 10,
        sortBy: 'timestamp',
        sortDir: 'desc',
      };
      const mockElasticsearchResponse = {
        hits: {
          total: { value: 2 },
          hits: [
            {
              _id: 'message1',
              _source: {
                conversationId: 'conversation123',
                content: 'Message 1 content',
                timestamp: '2024-01-15T10:00:00Z',
                createdBy: 'user1',
                metadata: { key1: 'value1' },
              },
            },
            {
              _id: 'message2',
              _source: {
                conversationId: 'conversation123',
                content: 'Message 2 content',
                timestamp: '2024-01-15T11:00:00Z',
                createdBy: 'user2',
                metadata: { key1: 'value2' },
              },
            },
          ],
        },
      };
      (elasticsearchService.search as jest.Mock).mockResolvedValue(mockElasticsearchResponse);

      const result: SearchMessagesResponseDto = await service.searchMessages(payload);

      expect(elasticsearchService.search).toHaveBeenCalledWith({
        index: 'messages',
        from: 0,
        size: 10,
        query: { match: { content: 'search query' } },
        sort: { timestamp: 'desc' },
      });
      expect(result).toEqual({
        data: [
          {
            id: 'message1',
            conversationId: 'conversation123',
            content: 'Message 1 content',
            timestamp: '2024-01-15T10:00:00Z',
            senderId: 'user1',
            metadata: { key1: 'value1' },
          },
          {
            id: 'message2',
            conversationId: 'conversation123',
            content: 'Message 2 content',
            timestamp: '2024-01-15T11:00:00Z',
            senderId: 'user2',
            metadata: { key1: 'value2' },
          },
        ],
        paging: { page: 1, limit: 10, count: 2, totalPages: 1 },
      });
    });

    it('should handle empty search results', async () => {
      const payload: SearchMessagesRequestDto = { q: 'empty query' };
      const mockElasticsearchResponse = {
        hits: {
          total: { value: 0 },
          hits: [],
        },
      };
      (elasticsearchService.search as jest.Mock).mockResolvedValue(mockElasticsearchResponse);

      const result: SearchMessagesResponseDto = await service.searchMessages(payload);

      expect(result).toEqual({
        data: [],
        paging: { page: 1, limit: 10, count: 0, totalPages: 0 },
      });
    });

    it('should throw BadRequestException on Elasticsearch error', async () => {
      const payload: SearchMessagesRequestDto = { q: 'error query' };
      const errorMessage = 'Elasticsearch error';
      (elasticsearchService.search as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(service.searchMessages(payload)).rejects.toThrowError(BadRequestException);
      await expect(service.searchMessages(payload)).rejects.toThrow(errorMessage);
    });
  });
});

