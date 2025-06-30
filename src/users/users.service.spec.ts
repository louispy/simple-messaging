import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateUserDto } from './dto/users.request.dto';
import { User } from './schemas/users.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repo: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            insert: jest.fn(),
            findByIdentifier: jest.fn(),
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            getUser: jest.fn().mockReturnValue({ userId: 'testUserId' }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user and return the user ID', async () => {
      const payload: CreateUserDto = {
        username: 'testuser',
        password: 'password',
      };
      const savedUser = { id: 'newUserId' };
      (repo.insert as jest.Mock).mockResolvedValue(savedUser);

      const result = await service.createUser(payload);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(result).toEqual({ id: 'newUserId', message: 'Success create user' });
    });

    it('should handle missing name and email in payload', async () => {
      const payload: CreateUserDto = {
        username: 'testuser',
        password: 'password',
      };
      const savedUser = { id: 'newUserId' };
      (repo.insert as jest.Mock).mockResolvedValue(savedUser);

      await service.createUser(payload);

      expect(repo.insert).toHaveBeenCalled();
    });

    it('should handle error during user creation', async () => {
      const payload: CreateUserDto = {
        username: 'testuser',
        password: 'password',
      };
      const errorMessage = 'Failed to create user';
      (repo.insert as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(service.createUser(payload)).rejects.toThrowError(BadRequestException);
      await expect(service.createUser(payload)).rejects.toThrow(errorMessage);
    });
  });

  describe('findOne', () => {
    it('should call findByIdentifier with the username', async () => {
      const username = 'testuser';
      const expectedUser: User | null = { id: 'user123', username } as User;
      (repo.findByIdentifier as jest.Mock).mockResolvedValue(expectedUser);

      const result = await service.findOne(username);

      expect(repo.findByIdentifier).toHaveBeenCalledWith(username);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user is not found', async () => {
      const username = 'nonexistentuser';
      (repo.findByIdentifier as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne(username);

      expect(repo.findByIdentifier).toHaveBeenCalledWith(username);
      expect(result).toBeNull();
    });
  });
});
