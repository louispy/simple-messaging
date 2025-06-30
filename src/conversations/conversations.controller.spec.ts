import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
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
import { ValidateObjectIdPipe } from '../common/pipes/oid.pipe'; // Import the pipe

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: {
            create: jest.fn(),
            getMessages: jest.fn(),
            searchMessages: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    service = module.get<ConversationsService>(ConversationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createConversation', () => {
    it('should call the service with the correct payload', async () => {
      const payload: CreateConversationRequestDto = {};
      const expectedResponse: CreateConversationResponseDto = { id: '123', message: 'Success' };
      (service.create as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.createConversation(payload);

      expect(service.create).toHaveBeenCalledWith(payload);
    });

    it('should return the value from the service', async () => {
      const payload: CreateConversationRequestDto = {};
      const expectedResponse: CreateConversationResponseDto = { id: '123', message: 'Success' };
      (service.create as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await controller.createConversation(payload);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getMessages', () => {
    it('should call the service with the correct query object', async () => {
      const conversationId = 'conversation123';
      const queryParams: GetMessagesRequestDto = { page: 1, limit: 10 };
      const expectedQuery: GetMessagesRequestDto = { conversationId: conversationId, page: 1, limit: 10 };
      const expectedResponse: GetMessagesResponseDto = { data: [], paging: { page: 1, limit: 10, count: 0, totalPages: 0 } };
      (service.getMessages as jest.Mock).mockResolvedValue(expectedResponse);

      // Mock the ValidateObjectIdPipe to return the same ID.
      const validateObjectIdPipe = new ValidateObjectIdPipe();
      jest.spyOn(validateObjectIdPipe, 'transform').mockImplementation((value) => value);


      await controller.getMessages(conversationId, queryParams);

      expect(service.getMessages).toHaveBeenCalledWith(expectedQuery);
    });

    it('should return the value from the service', async () => {
      const conversationId = 'conversation123';
      const queryParams: GetMessagesRequestDto = { page: 1, limit: 10 };
      const expectedResponse: GetMessagesResponseDto = { data: [], paging: { page: 1, limit: 10, count: 0, totalPages: 0 } };
      (service.getMessages as jest.Mock).mockResolvedValue(expectedResponse);

      // Mock the ValidateObjectIdPipe
      const validateObjectIdPipe = new ValidateObjectIdPipe();
      jest.spyOn(validateObjectIdPipe, 'transform').mockImplementation((value) => value);

      const result = await controller.getMessages(conversationId, queryParams);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('searchMessages', () => {
    it('should call the service with the correct query object', async () => {
      const conversationId = 'conversation123';
      const queryParams: SearchMessagesRequestDto = { q: 'search' };
      const expectedQuery: SearchMessagesRequestDto = { conversationId: conversationId, q: 'search' };
      const expectedResponse: SearchMessagesResponseDto = { data: [], paging: { page: 1, limit: 10, count: 0, totalPages: 0 } };
      (service.searchMessages as jest.Mock).mockResolvedValue(expectedResponse);

            // Mock the ValidateObjectIdPipe
      const validateObjectIdPipe = new ValidateObjectIdPipe();
      jest.spyOn(validateObjectIdPipe, 'transform').mockImplementation((value) => value);


      await controller.searchMessages(conversationId, queryParams);

      expect(service.searchMessages).toHaveBeenCalledWith(expectedQuery);
    });

    it('should return the value from the service', async () => {
      const conversationId = 'conversation123';
      const queryParams: SearchMessagesRequestDto = { q: 'search' };
      const expectedResponse: SearchMessagesResponseDto = { data: [], paging: { page: 1, limit: 10, count: 0, totalPages: 0 } };
      (service.searchMessages as jest.Mock).mockResolvedValue(expectedResponse);

      // Mock the ValidateObjectIdPipe
      const validateObjectIdPipe = new ValidateObjectIdPipe();
      jest.spyOn(validateObjectIdPipe, 'transform').mockImplementation((value) => value);

      const result = await controller.searchMessages(conversationId, queryParams);

      expect(result).toEqual(expectedResponse);
    });
  });
});
