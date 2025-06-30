import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = { id: 'user123', username: 'testuser' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockReturnValue({ accessToken: 'testToken' }),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true }) // Mock LocalAuthGuard
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mock JwtAuthGuard
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with the request user', async () => {
      const req = { user: mockUser };
      await controller.login(req);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should return the result of authService.login', async () => {
      const req = { user: mockUser };
      const result = await controller.login(req);
      expect(result).toEqual({ accessToken: 'testToken' });
    });
  });

  describe('getProfile', () => {
    it('should return the request user', async () => {
      const req = { user: mockUser };
      const result = controller.getProfile(req);
      expect(result).toEqual(mockUser);
    });
  });
});
