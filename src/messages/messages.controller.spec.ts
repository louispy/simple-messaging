import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CreateMessageRequestDto } from './dto/message.request.dto';
import { CreateMessageResponseDto } from './dto/message.response.dto';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: {
            createMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMessage', () => {
    it('should call the service with the correct payload', async () => {
      const payload: CreateMessageRequestDto = {
        content: 'Test message',
        conversationId: 'conversationId',
      };

      const expectedResponse: CreateMessageResponseDto = {
        id: 'message123',
        message: 'hello',
      };

      jest.spyOn(service, 'createMessage').mockResolvedValue(expectedResponse);

      await controller.createMessage(payload);

      expect(service.createMessage).toHaveBeenCalledWith(payload);
    });

    it('should return the response from the service', async () => {
      const payload: CreateMessageRequestDto = {
        content: 'Test message',
        conversationId: 'conversationId',
      };

      const expectedResponse: CreateMessageResponseDto = {
        id: 'message123',
        message: 'hello',
      };

      jest.spyOn(service, 'createMessage').mockResolvedValue(expectedResponse);

      const result = await controller.createMessage(payload);

      expect(result).toEqual(expectedResponse);
    });
  });
});
