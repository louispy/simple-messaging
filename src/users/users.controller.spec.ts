import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/users.request.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.createUser with the payload', async () => {
      const payload: CreateUserDto = {
        username: 'testuser',
        password: 'password',
      };
      await controller.create(payload);
      expect(service.createUser).toHaveBeenCalledWith(payload);
    });

    it('should return the result of usersService.createUser', async () => {
      const payload: CreateUserDto = {
        username: 'testuser',
        password: 'password',
      };
      const expectedResult = { id: 'newUserId', message: 'Success' };
      (service.createUser as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(payload);
      expect(result).toEqual(expectedResult);
    });
  });
});
