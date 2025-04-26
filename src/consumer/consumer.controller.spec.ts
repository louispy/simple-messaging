import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { KafkaContext } from '@nestjs/microservices';

describe('ConsumerController', () => {
  let controller: ConsumerController;
  let service: ConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumerController],
      providers: [
        {
          provide: ConsumerService,
          useValue: {
            retry: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConsumerController>(ConsumerController);
    service = module.get<ConsumerService>(ConsumerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleMessage', () => {
    it('should call the service retry method with the payload and context', async () => {
      const payload = { key: 'value' };
      const context = {} as KafkaContext;

      await controller.handleMessage(payload, context);

      expect(service.retry).toHaveBeenCalledWith(payload, context);
    });
  });
});
