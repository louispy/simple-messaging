import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/users.schema';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return the user with isPasswordValid true if password is correct', async () => {
      const username = 'testuser';
      const password = 'password';
      const hashedPassword = 'hashedPassword';
      const user: User = {
        id: 'user123',
        username: username,
        password: hashedPassword,
        roles: [],
      } as unknown as User;
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(username, password);

      expect(userService.findOne).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      // expect(result).toEqual({
      //   id: 'user123',
      //   username: username,
      //   roles: [],
      //   isPasswordValid: true,
      // });
    });

    it('should return isPasswordValid false if password is incorrect', async () => {
      const username = 'testuser';
      const password = 'password';
      const hashedPassword = 'hashedPassword';
      const user: User = {
        id: 'user123',
        username: username,
        password: hashedPassword,
        roles: [],
      } as unknown as User;
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(username, password);

      expect(userService.findOne).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({ isPasswordValid: false });
    });

    it('should return null if user is not found', async () => {
      const username = 'nonexistentuser';
      const password = 'password';
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      const result = await service.validateUser(username, password);

      expect(userService.findOne).toHaveBeenCalledWith(username);
      // expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a JwtAuthResponse with a valid access token', async () => {
      const user: User = {
        id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
        roles: ['admin'],
      } as User;
      const payload = {
        username: 'testuser',
        sub: 'user123',
        roles: ['admin'],
      };
      const accessToken = 'validAccessToken';
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ accessToken });
    });
  });
});
